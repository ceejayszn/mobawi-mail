import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/api-auth";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const auth = await validateApiKey(request);
    if (!auth.valid) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const { to, subject, templateId, slug, payload, html: rawHtml } = body;

    if (!to) {
      return NextResponse.json({ error: "Missing required 'to' field" }, { status: 400 });
    }

    // Resolve template if templateId or slug is provided
    let template = null;
    if (templateId) {
      template = await prisma.template.findUnique({ where: { id: templateId } });
    } else if (slug) {
      template = await prisma.template.findUnique({ where: { slug } });
    }

    let finalSubject = subject || template?.subject || "No Subject";
    let finalHtml = rawHtml || template?.html || undefined;

    // Inject dynamic variables if payload provided
    const vars: Record<string, string> = {
      current_year: new Date().getFullYear().toString(),
      ...(payload || {}),
    };

    if (finalHtml && vars) {
      for (const [key, value] of Object.entries(vars)) {
        finalHtml = finalHtml.replace(new RegExp(`{{${key}}}`, "g"), String(value));
      }
    }

    if (finalSubject && vars) {
      for (const [key, value] of Object.entries(vars)) {
        finalSubject = finalSubject.replace(new RegExp(`{{${key}}}`, "g"), String(value));
      }
    }

    // 1. Log queue attempt as PROCESSING
    const queueItem = await prisma.queue.create({
      data: {
        recipient: to,
        subject: finalSubject,
        templateId: template?.id || null,
        payload: vars,
        status: "PROCESSING",
      },
    });

    try {
      // 2. Synchronous Resend email dispatch
      const resendResponse = await sendEmail({
        to,
        subject: finalSubject,
        html: finalHtml,
        text: finalHtml ? undefined : "Please view this email in an HTML-compatible email client.",
      });

      // 3. Mark Queue item as SENT and record History
      await prisma.$transaction([
        prisma.queue.update({
          where: { id: queueItem.id },
          data: { status: "SENT", sentAt: new Date() },
        }),
        prisma.history.create({
          data: {
            recipient: to,
            subject: finalSubject,
            templateId: template?.id || null,
            payload: vars,
            response: resendResponse ? (resendResponse as any) : {},
          },
        }),
        prisma.log.create({
          data: {
            action: "SEND_EMAIL_SUCCESS",
            entityType: "Queue",
            entityId: queueItem.id,
            details: { to, subject: finalSubject, resendId: (resendResponse as any)?.id },
            apiKeyId: auth.apiKey?.id,
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: "Email sent successfully",
        queueId: queueItem.id,
        resendId: (resendResponse as any)?.id,
      });
    } catch (sendError: any) {
      // 4. Mark Queue item as FAILED
      await prisma.$transaction([
        prisma.queue.update({
          where: { id: queueItem.id },
          data: {
            status: "FAILED",
            error: sendError.message,
            attempts: 1,
          },
        }),
        prisma.log.create({
          data: {
            action: "SEND_EMAIL_FAILED",
            entityType: "Queue",
            entityId: queueItem.id,
            details: { to, subject: finalSubject, error: sendError.message },
            apiKeyId: auth.apiKey?.id,
          },
        }),
      ]);

      return NextResponse.json(
        {
          success: false,
          error: "Email delivery failed",
          details: sendError.message,
          queueId: queueItem.id,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Email send route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
