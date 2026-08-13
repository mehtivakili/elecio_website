import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "سفارش محصول - ElecIO SMART DNC",
  description: "سفارش دستگاه ElecIO SMART DNC - ثبت درخواست سفارش یا تماس مستقیم با ما. اطلاعات تماس و آدرس ما را مشاهده کنید.",
  keywords: "سفارش DNC, خرید DNC, سفارش ElecIO, خرید دستگاه DNC, سفارش دستگاه CNC, تماس با الکسیو",
};

export default function OrderingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}



