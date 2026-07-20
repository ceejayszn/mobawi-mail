import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { queueId } = await request.json();
    if (!queueId) {
      return NextResponse.json({ error: "Queue ID is required" }, { status: 400 });
    }

    const item = await prisma.queue.findUnique({
      where: { id: queueId },
      include: { template: true },
    });

    if (!item) {
      return NextResponse.json({ error: "Queue item not found" }, { status: 404 });
    }

    // Mark as processing
    await prisma.queue.update({
      where: { id: queueId },
      data: { status: "PROCESSING" },
    });

    try {
      let finalHtml = item.template?.html || undefined;
      let finalSubject = item.template?.subject || item.subject;

      const payload = item.payload as Record<string, string>;
      if (payload && finalHtml) {
        for (const [key, value] of Object.entries(payload)) {
          finalHtml = finalHtml.replace(new RegExp(`{{${key}}}`, "g"), String(value));
        }
      }

      const resendResponse = await sendEmail({
        to: item.recipient,
        subject: finalSubject,
        html: finalHtml,
        text: finalHtml ? undefined : "Please view this email in an HTML-compatible email client.",
      });

      await prisma.$transaction([
        prisma.queue.update({
          where: { id: queueId },
          data: { status: "SENT", sentAt: new Date(), attempts: item.attempts + 1, error: null },
        }),
        prisma.history.create({
          data: {
            recipient: item.recipient,
            subject: finalSubject,
            templateId: item.templateId,
            payload: item.payload || {},
            response: resendResponse ? (resendResponse as any) : {},
          },
        }),
        prisma.log.create({
          data: {
            action: "RETRY_EMAIL_SUCCESS",
            entityType: "Queue",
            entityId: queueId,
            userId: session.userId,
          },
        }),
      ]);

      return NextResponse.json({ success: true, message: "Email retried successfully" });
    } catch (sendError: any) {
      await prisma.queue.update({
        where: { id: queueId },
        data: {
          status: "FAILED",
          error: sendError.message,
          attempts: item.attempts + 1,
        },
      });

      return NextResponse.json(
        { success: false, error: "Retry failed", details: sendError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Retry route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
