import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mobawi Mail",
  description: "Internal email delivery and template management platform.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
      </head>
      <body className="font-sans antialiased text-[#f0f0f0] bg-[#111111]">{children}</body>
    </html>
  );
}
