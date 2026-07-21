import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

export async function sendEmail(options: SendEmailOptions) {
  // Read key from environment variable only - never hardcode secrets in source
  let apiKey = process.env.RESEND_API_KEY || "";

  // Allow DB override (e.g. set from Settings page)
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "RESEND_API_KEY" },
    });
    if (setting?.value && setting.value.startsWith("re_")) {
      apiKey = setting.value;
    }
  } catch (_) {}

  if (!apiKey || !apiKey.startsWith("re_")) {
    throw new Error("No valid Resend API key configured. Set RESEND_API_KEY in Vercel environment variables.");
  }

  const from = options.from || "Mobawi Mail <onboarding@resend.dev>";
  const payload: any = {
    from,
    to: options.to,
    subject: options.subject,
  };

  if (options.html) payload.html = options.html;
  if (options.text) payload.text = options.text;
  if (options.cc) payload.cc = options.cc;
  if (options.bcc) payload.bcc = options.bcc;

  if (!payload.html && !payload.text) {
    payload.text = "Notification from Mobawi Mail";
  }

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send(payload);

  if (error) {
    console.error("Resend API error:", error);
    throw new Error(error.message);
  }

  return data;
}
