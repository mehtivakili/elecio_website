import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "درباره ما - ElecIO SMART DNC",
  description: "داستان شکل‌گیری و پیشرفت ElecIO SMART DNC. بیش از سه سال کار مداوم، تست‌های فراوان و بهبودهای مستمر برای ارائه محصولی برتر.",
  keywords: "درباره ElecIO, تیم سازنده DNC, تاریخچه ElecIO SMART DNC, مهندس مشایخ, مهندس وکیلی, مهندس ساکی",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

