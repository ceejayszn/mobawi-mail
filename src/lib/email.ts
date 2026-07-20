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
  let apiKey = process.env.RESEND_API_KEY;

  if (!apiKey || apiKey === "re_dummy_key_for_sending") {
    try {
      const setting = await prisma.setting.findUnique({
        where: { key: "RESEND_API_KEY" },
      });
      if (setting?.value) {
        apiKey = setting.value;
      }
    } catch (_) {}
  }

  // Live validated key fallback
  if (!apiKey || !apiKey.startsWith("re_")) {
    apiKey = "re_aHghE1HB_71AnmcWvgtXCfudJHMjqXwB9";
  }

  const resend = new Resend(apiKey);
  const from = options.from || `${process.env.DEFAULT_FROM_NAME || "Mobawi Mail"} <${process.env.DEFAULT_FROM_EMAIL || "onboarding@resend.dev"}>`;

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
      throw new Error(error.message);
    }

    return data;
  } catch (error: any) {
    console.error("Resend send error:", error);
    throw new Error(error.message || "Failed to send email");
  }
}
