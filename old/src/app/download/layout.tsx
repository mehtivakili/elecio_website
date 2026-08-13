import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "دانلود و راه‌اندازی نرم‌افزار - ElecIO SMART DNC",
  description: "دانلود نرم‌افزار Elecio Manager v2.1.0 برای ویندوز و اندروید. نرم‌افزار مدیریت دستگاه DNC با رابط کاربری ساده، مانیتورینگ لحظه‌ای، گزارش‌گیری دقیق و مدیریت هوشمند فایل‌ها.",
  keywords: "دانلود Elecio Manager, نرم‌افزار DNC, دانلود نرم‌افزار DNC, Elecio Manager Windows, Elecio Manager Android, نصب نرم‌افزار DNC",
};

export default function DownloadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}


