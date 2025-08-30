import type { Metadata } from "next";
import { Roboto_Mono } from "next/font/google";
import "./globals.css";

const mono = Roboto_Mono({
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "ZKTerminal",
  description: "ZKTerminal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={mono.className}>{children}</body>
    </html>
  );
}
