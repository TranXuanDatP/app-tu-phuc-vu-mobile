import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "IOC CSKH — Cổng Khách hàng",
    template: "%s · IOC CSKH",
  },
  description: "Cổng thông tin khách hàng Công ty IOC - Dịch vụ cấp nước",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
