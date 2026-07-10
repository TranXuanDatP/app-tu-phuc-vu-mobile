import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-bv",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "My QUAWACO · App khách hàng",
    template: "%s · My QUAWACO",
  },
  description: "Ứng dụng tự phục vụ khách hàng — My QUAWACO (dịch vụ cấp nước)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={beVietnam.variable} suppressHydrationWarning>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
