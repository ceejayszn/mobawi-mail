import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

// Ensure this route is dynamic and not cached
export const dynamic = "force-dynamic";

const BATCH_SIZE = 10;
const MAX_ATTEMPTS = 5;

export async function GET(request: Request) {
  try {
    // Basic protection to ensure only Vercel Cron or internal systems call this
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find pending or retry emails, sorted by priority (high to low) and scheduledAt (oldest first)
    const emailsToProcess = await prisma.queue.findMany({
      where: {
        status: {
          in: ["PENDING", "RETRY"],
        },
        scheduledAt: {
          lte: new Date(),
        },
        attempts: {
          lt: MAX_ATTEMPTS,
        },
      },
      orderBy: [
        { priority: "desc" },
        { scheduledAt: "asc" },
      ],
      take: BATCH_SIZE,
      include: {
        template: true,
      },
    });

    if (emailsToProcess.length === 0) {
      return NextResponse.json({ message: "No emails to process" });
    }

    const results = [];

    for (const item of emailsToProcess) {
      // Mark as processing
      await prisma.queue.update({
        where: { id: item.id },
        data: { status: "PROCESSING" },
      });

      try {
        // Here we would normally compile the template with the payload variables.
        // For now, if no HTML is provided in the template, we'll fall back to text.
        // In a full implementation, React Email rendering would happen here using the template.reactCode.
        
        let finalHtml = item.template?.html || undefined;
        let finalSubject = item.template?.subject || item.subject;

        // Simple variable replacement
        const payload = item.payload as Record<string, string>;
        if (payload && finalHtml) {
          for (const [key, value] of Object.entries(payload)) {
            finalHtml = finalHtml.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
          }
        }
        if (payload && finalSubject) {
          for (const [key, value] of Object.entries(payload)) {
            finalSubject = finalSubject.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
          }
        }

        const resendResponse = await sendEmail({
          to: item.recipient,
          subject: finalSubject,
          html: finalHtml,
          text: finalHtml ? undefined : "Please view this email in an HTML-compatible client.",
        });

        // Mark as sent and log to history
        await prisma.$transaction([
          prisma.queue.update({
            where: { id: item.id },
            data: { status: "SENT", sentAt: new Date() },
          }),
          prisma.history.create({
            data: {
              recipient: item.recipient,
              subject: finalSubject,
              templateId: item.templateId,
              payload: item.payload,
              response: resendResponse,
            },
          }),
        ]);

        results.push({ id: item.id, status: "SENT" });
      } catch (error: any) {
        // Handle failure
        const newAttempts = item.attempts + 1;
        const newStatus = newAttempts >= MAX_ATTEMPTS ? "FAILED" : "RETRY";
        
        // Exponential backoff logic for retry (e.g., 5 min, 25 min, 125 min)
        const nextScheduledAt = new Date();
        nextScheduledAt.setMinutes(nextScheduledAt.getMinutes() + Math.pow(5, newAttempts));

        await prisma.queue.update({
          where: { id: item.id },
          data: {
            status: newStatus,
            attempts: newAttempts,
            error: error.message,
            scheduledAt: newStatus === "RETRY" ? nextScheduledAt : item.scheduledAt,
          },
        });

        results.push({ id: item.id, status: newStatus, error: error.message });
      }
    }

    return NextResponse.json({ processed: results.length, results });
  } catch (error: any) {
    console.error("Cron processing error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
