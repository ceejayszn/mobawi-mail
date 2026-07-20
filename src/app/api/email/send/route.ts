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

    let template = null;
    try {
      if (templateId) {
        template = await prisma.template.findUnique({ where: { id: templateId } });
      } else if (slug) {
        template = await prisma.template.findUnique({ where: { slug } });
      }
    } catch (_) {}

    let finalSubject = subject || template?.subject || "No Subject";
    let finalHtml = rawHtml || template?.html || undefined;

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

    let queueItem = null;
    try {
      queueItem = await prisma.queue.create({
        data: {
          recipient: to,
          subject: finalSubject,
          templateId: template?.id || null,
          payload: vars,
          status: "PROCESSING",
        },
      });
    } catch (_) {}

    try {
      const resendResponse = await sendEmail({
        to,
        subject: finalSubject,
        html: finalHtml,
        text: finalHtml ? undefined : "Please view this email in an HTML-compatible email client.",
      });

      if (queueItem) {
        try {
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
        } catch (_) {}
      }

      return NextResponse.json({
        success: true,
        message: "Email sent successfully!",
        queueId: queueItem?.id || "q_local",
        resendId: (resendResponse as any)?.id || "msg_success",
      });
    } catch (sendError: any) {
      if (queueItem) {
        try {
          await prisma.queue.update({
            where: { id: queueItem.id },
            data: {
              status: "FAILED",
              error: sendError.message,
              attempts: 1,
            },
          });
        } catch (_) {}
      }

      return NextResponse.json(
        {
          success: false,
          error: "Email delivery failed",
          details: sendError.message,
          queueId: queueItem?.id || null,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Email send route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
