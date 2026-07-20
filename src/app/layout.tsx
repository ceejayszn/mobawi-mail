import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mobawi Mail",
  description: "Internal email delivery and template management platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased text-foreground bg-background">{children}</body>
    </html>
  );
}
