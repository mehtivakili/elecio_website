'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from 'antd';
import { WifiOutlined, SendOutlined, ApiOutlined, ArrowLeftOutlined, ThunderboltOutlined, SafetyOutlined, ToolOutlined } from '@ant-design/icons';
import { ReactNode } from 'react';

type Feature = {
  icon: ReactNode | string;
  title: string;
  description: string;
  isImage?: boolean;
};

const features: Feature[] = [
  {
    icon: <WifiOutlined className="text-4xl" />,
    title: 'ارتباط بی‌سیم (Wireless DNC)',
    description: 'حذف کامل کابل‌کشی و عدم نیاز به اتصال و قطع فلش‌های USB. مانیتورینگ و گزارش‌گیری دقیق خط تولید با محاسبه زمان خواب دستگاه.',
  },
  {
    icon: <SendOutlined className="text-4xl" />,
    title: 'انتقال مستقیم فایل NC',
    description: 'ارسال فایل‌ها از کامپیوتر طراحی یا مدیر به حافظه دستگاه از طریق Wi-Fi. اسکنر هوشمند شبکه برای شناسایی خودکار دستگاه‌ها.',
  },
  {
    icon: <ApiOutlined className="text-4xl" />,
    title: 'سازگاری کامل با تمام کنترولرها',
    description: 'پشتیبانی از Fanuc، Heidenhain (iTNC 530, TNC370)، Siemens، Mitsubishi، Haas و Charmilles. تغییر Baud Rate بدون نیاز به ریستارت.',
  },
  {
    icon: <ThunderboltOutlined className="text-4xl" />,
    title: 'پردازنده دو هسته‌ای',
    description: 'ارسال برنامه بعدی در حالی که برنامه فعلی در حال اجرا است. بدون تأخیر، حداکثر زمان فعالیت. قابلیت تکرار خودکار برای سری‌کاری و حالت خواب برای کاهش استهلاک.',
  },
  {
    icon: <SafetyOutlined className="text-4xl" />,
    title: 'پورت RS232 محافظت شده',
    description: 'مدار ایزوله داخلی در برابر ولتاژهای ناگهانی که باعث آسیب‌های پرهزینه به برد می‌شود، محافظت می‌کند. ذخیره‌سازی ایمن پارامترهای ماشین.',
  },
  {
    icon: <ToolOutlined className="text-4xl" />,
    title: 'نصب آسان و سریع',
    description: 'بدون نیاز به تغییر در سیم کشی یا تابلو برق دستگاه.',
  },
];

export default function WirelessFeaturesSection() {
  return (
    <section id="wireless-features" className="w-full py-24 relative overflow-hidden" dir="rtl">
      <div className="relative z-10 container mx-auto px-4 md:px-8 lg:px-16">
        <div className="relative p-8 md:p-12 lg:p-16">
            {/* Title */}
            <div className="text-center mb-12">
              <h2 
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
                style={{
                  textShadow: '0 2px 20px rgba(139, 92, 246, 0.3)',
                  letterSpacing: '0.5px',
                }}
              >
                بچه غول دوست داشتنی؟
              </h2>

              <div className="w-24 h-0.5 mx-auto bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
            </div>

            {/* Device Image - Centered */}
            <div className="flex justify-center mb-16">
              <div 
                className="relative"
                style={{
                  maxWidth: '500px',
                  width: '100%',
                  aspectRatio: '3/4',
                  minHeight: '600px',
                }}
              >
                <Image
                  src="/landing/device.png"
                  alt="ELEOO Industrial Device"
                  fill
                  className="object-contain"
                  priority
                  style={{
                    filter: 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3))',
                  }}
                />
              </div>
            </div>

            {/* Features Grid - First Row (3 columns) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {features.slice(0, 3).map((feature, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center group"
                  style={{
                    transition: 'transform 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Icon */}
                  {typeof feature.icon !== 'string' && (
                    <div 
                      className="mb-6 text-blue-400 group-hover:text-blue-300 transition-colors"
                      style={{
                        filter: 'drop-shadow(0 4px 12px rgba(59, 130, 246, 0.3))',
                      }}
                    >
                      {feature.icon}
                    </div>
                  )}
                  
                  {/* Content */}
                  <h3 
                    className="text-xl font-bold mb-3 text-white group-hover:text-blue-300 transition-colors"
                    style={{
                      textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p 
                    className="text-base text-gray-200 leading-relaxed"
                    style={{
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Features Grid - Second Row (3 columns) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.slice(3, 6).map((feature, index) => (
                <div
                  key={index + 3}
                  className="flex flex-col items-center text-center group"
                  style={{
                    transition: 'transform 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Icon */}
                  {typeof feature.icon !== 'string' && (
                    <div 
                      className="mb-6 text-blue-400 group-hover:text-blue-300 transition-colors"
                      style={{
                        filter: 'drop-shadow(0 4px 12px rgba(59, 130, 246, 0.3))',
                      }}
                    >
                      {feature.icon}
                    </div>
                  )}
                  
                  {/* Content */}
                  <h3 
                    className="text-xl font-bold mb-3 text-white group-hover:text-blue-300 transition-colors"
                    style={{
                      textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p 
                    className="text-base text-gray-200 leading-relaxed"
                    style={{
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

        </div>
      </div>

      {/* More Info Button - Outside background (with white border) */}
      <div className="text-center mt-12">
        <Link href="/wireless">
          <Button
            type="default"
            size="large"
            icon={<ArrowLeftOutlined />}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              color: '#ffffff',
              borderRadius: '16px',
              height: '48px',
              padding: '0 32px',
              fontSize: '16px',
            }}
            className="hover:bg-white/10 hover:border-white"
          >
            اطلاعات بیشتر
          </Button>
        </Link>
      </div>
    </section>
  );
}

