import type { Metadata } from "next";
import AntdProvider from "@/providers/AntdProvider";
import Topbar from "@/components/layout/Topbar";
import Footer from "@/components/layout/Footer";
import MouseSpotlight from "@/components/effects/MouseSpotlight";
import "./globals.css";

export const metadata: Metadata = {
  title: "ElecIO SMART DNC - تجربه هوشمندسازی ماشین‌آلات CNC",
  description: "نسل جدید ارتباط با CNC دقیق و پایدار. دستگاه CNC شما آنلاین و هوشمند می‌شود. پایداری ارتباط، افزایش بهره‌وری. پشتیبانی انحصاری از پروتکل LSV2 برای Heidenhain.",
  keywords: "DNC, CNC, LSV2, Heidenhain, Fanuc, Siemens, Mitsubishi, Wireless DNC, مانیتورینگ CNC, هوشمندسازی ماشین‌آلات",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="ltr">
      <body
        className="antialiased"
        style={{ fontFamily: 'Vazirmatn, sans-serif' }}
      >
        <AntdProvider>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Topbar />
            <main style={{ flex: 1 }}>
              {children}
            </main>
            <Footer />
            <MouseSpotlight />
          </div>
        </AntdProvider>
      </body>
    </html>
  );
}
