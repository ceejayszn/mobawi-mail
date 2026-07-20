import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_build_key");

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
  const from = options.from || `${process.env.DEFAULT_FROM_NAME} <${process.env.DEFAULT_FROM_EMAIL}>`;

  const payload: any = {
    from,
    to: options.to,
    subject: options.subject,
  };

  if (options.html) payload.html = options.html;
  if (options.text) payload.text = options.text;
  if (options.cc) payload.cc = options.cc;
  if (options.bcc) payload.bcc = options.bcc;

  // Fallback text if neither html nor text provided
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
