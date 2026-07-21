import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

// Internal dashboard email sending - uses session auth, no API key needed
export async function POST(request: Request) {
  try {
    // Must be logged in
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { to, subject, html: rawHtml, templateId, payload } = body;

    if (!to || !subject) {
      return NextResponse.json({ error: "Missing required fields: to, subject" }, { status: 400 });
    }

    let finalSubject = subject;
    let finalHtml = rawHtml || "";

    // Inject template variables
    const vars: Record<string, string> = {
      current_year: new Date().getFullYear().toString(),
      ...(payload || {}),
    };

    for (const [key, value] of Object.entries(vars)) {
      finalHtml = finalHtml.replace(new RegExp(`{{${key}}}`, "g"), String(value));
      finalSubject = finalSubject.replace(new RegExp(`{{${key}}}`, "g"), String(value));
    }

    // Send the email via Resend
    const result = await sendEmail({
      to,
      subject: finalSubject,
      html: finalHtml || undefined,
      text: finalHtml ? undefined : "Email from Mobawi Mail",
    });

    // Log to queue & history if DB available
    try {
      const queueItem = await prisma.queue.create({
        data: {
          recipient: to,
          subject: finalSubject,
          templateId: templateId || null,
          payload: vars,
          status: "SENT",
          sentAt: new Date(),
        },
      });

      await prisma.history.create({
        data: {
          recipient: to,
          subject: finalSubject,
          templateId: templateId || null,
          payload: vars,
          response: result ? (result as any) : {},
        },
      });
    } catch (_) {
      // DB logging is best-effort
    }

    return NextResponse.json({
      success: true,
      message: "Email sent successfully!",
      id: (result as any)?.id || `msg_${Date.now()}`,
    });
  } catch (error: any) {
    console.error("Dashboard compose send error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send email" },
      { status: 500 }
    );
  }
}
