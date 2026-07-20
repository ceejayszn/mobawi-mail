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
  // Always default to your active validated working key: re_aHghE1HB_71AnmcWvgtXCfudJHMjqXwB9
  let apiKey = "re_aHghE1HB_71AnmcWvgtXCfudJHMjqXwB9";

  // Check DB custom setting override
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "RESEND_API_KEY" },
    });
    if (setting?.value && setting.value.startsWith("re_") && setting.value.length > 20) {
      apiKey = setting.value;
    }
  } catch (_) {}

  // Check environment variable if custom set
  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.startsWith("re_aHghE1HB")) {
    apiKey = process.env.RESEND_API_KEY;
  }

  const resend = new Resend(apiKey);
  
  // Resend free tier requires onboarding@resend.dev as sender
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

  try {
    const { data, error } = await resend.emails.send(payload);

    if (error) {
      console.error("Resend API returned error:", error);
      throw new Error(error.message);
    }

    return data;
  } catch (error: any) {
    console.error("Resend send error:", error);
    throw new Error(error.message || "Failed to send email");
  }
}
