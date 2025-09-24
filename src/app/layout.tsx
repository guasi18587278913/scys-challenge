import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SCYS 减脂挑战",
  description: "三人私密减脂挑战面板",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased bg-base text-ink">
        <div className="bg-canvas min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
