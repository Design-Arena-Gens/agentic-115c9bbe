import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Organic Marketing Agent",
  description: "Generate platform-ready marketing assets for digital products."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
