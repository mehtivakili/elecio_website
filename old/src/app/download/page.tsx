'use client';

import { DownloadOutlined, WindowsOutlined, AndroidOutlined, CheckCircleOutlined, BookOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import Link from 'next/link';
import Image from 'next/image';

const downloadLinks = {
  windows: 'https://storage.webprohost.ir/storage/others/apps/windows/ElecioManager Setup 2.1.0.exe',
  android: 'https://storage.webprohost.ir/storage/others/apps/android/Elecio Manager.apk',
};

const features = [
  'مانیتورینگ و پایش لحظه‌ای ارسال برنامه‌ها',
  'گزارش‌گیری دقیق از اجرای برنامه‌های NC',
  'تغییر تنظیمات ارتباط با پورت سریال (Baud Rate و ...) از طریق اپلیکیشن بدون نیاز به ری‌استارت دستگاه و اعمال لحظه‌ای',
  'ارسال برنامه حتی در حین اجرای برنامه دیگر (به لطف پردازنده 2 هسته‌ای)',
  'راه‌اندازی سریع دستگاه با رم‌ریدر جهت انتقال تنظیمات اولیه، بدون دردسر و نیاز به تنظیمات پیچیده',
  'اسکنر هوشمند شبکه برای شناسایی خودکار دستگاه‌ها (ویژگی‌ای که حتی هایدن‌هاین هم ندارد!)',
  'پشتیبانی از ارسال گروهی برنامه‌های NC و صف‌بندی انتقال',
  'پشتیبانی از تایم سرور و پروتکل NTP جهت هماهنگ‌سازی گزارشات',
  'پشتیبانی از پروتکل LSV2 جهت ارتباط با کنترل‌های هایدن‌هاین بر بستر شبکه (ویژگی انحصاری در ایران، جایگزین TNCRemo)',
  'بهره‌گیری از جدیدترین تکنولوژی‌های توسعه نرم‌افزار (Powered by JS and GO)',
  'پشتیبانی از نسخه‌های ویندوز و اندروید',
  'بروزرسانی رایگان و پشتیبانی فنی مستمر',
];

export default function DownloadPage() {
  return (
    <main className="min-h-screen" dir="rtl">
      {/* Hero Section */}
      <section className="relative w-full py-24 md:py-32 overflow-hidden">
        {/* Background gradient effects */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 30% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
          }}
        />
        
        <div className="relative z-10 container mx-auto px-4 md:px-8 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <div>
              <div className="text-center lg:text-right mb-8">
                <h5 
                  className="text-lg md:text-xl text-gray-400 mb-4"
                  style={{
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  نرم‌افزار مدیریت دستگاه
                </h5>
                <h1 
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
                  style={{
                    fontFamily: 'monospace',
                    direction: 'ltr',
                    textAlign: 'center',
                    textShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
                    letterSpacing: '0.5px',
                  }}
                >
                  ELCIO Manager v2.1.0
                </h1>
                <p 
                  className="text-xl md:text-2xl text-gray-200 leading-relaxed"
                  style={{
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  برای استفاده از تمامی قابلیت‌های دستگاه، نسخه مناسب خود را دریافت و نصب کنید.
                </p>
              </div>

              {/* Download Buttons */}
              <div className="flex flex-col md:flex-row gap-6 justify-center lg:justify-start mt-12">
                {/* Windows Download */}
                <div className="flex flex-col items-center">
                  <p 
                    className="text-xl font-semibold text-white mb-4"
                    style={{
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    نسخه ویندوز
                  </p>
                  <a
                    href={downloadLinks.windows}
                    download
                    className="group relative"
                  >
                    <div 
                      className="w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                      style={{
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)',
                      }}
                    >
                      <WindowsOutlined className="text-5xl text-blue-400" />
                    </div>
                    <div 
                      className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <DownloadOutlined className="text-2xl text-blue-400" />
                    </div>
                  </a>
                </div>

                {/* Android Download */}
                <div className="flex flex-col items-center">
                  <p 
                    className="text-xl font-semibold text-white mb-4"
                    style={{
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    نسخه اندروید
                  </p>
                  <a
                    href={downloadLinks.android}
                    download
                    className="group relative"
                  >
                    <div 
                      className="w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                      style={{
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)',
                      }}
                    >
                      <AndroidOutlined className="text-5xl text-green-400" />
                    </div>
                    <div 
                      className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <DownloadOutlined className="text-2xl text-green-400" />
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Side - App Screenshot */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md">
                <div
                  style={{
                    background: 'linear-gradient(to right, rgba(139, 92, 246, 0.2) 0%, transparent 100%)',
                    position: 'absolute',
                    inset: 0,
                    zIndex: 1,
                    pointerEvents: 'none',
                  }}
                />
                <Image
                  src="/landing/devices.png"
                  alt="Elecio Manager App"
                  width={512}
                  height={512}
                  className="w-full h-auto relative z-0"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative w-full py-24" dir="rtl">
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 30% 50%, rgba(139, 92, 246, 0.05) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)',
          }}
        />
        
        <div className="relative z-10 container mx-auto px-4 md:px-8 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Features List */}
            <div className="lg:col-span-2">
              <div className="text-center lg:text-right mb-8">
                <div className="inline-flex items-center gap-3 mb-6">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)',
                    }}
                  >
                    <CheckCircleOutlined className="text-3xl text-blue-400" />
                  </div>
                  <h2 
                    className="text-3xl md:text-4xl lg:text-5xl font-bold text-white"
                    style={{
                      textShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
                      letterSpacing: '0.5px',
                    }}
                  >
                    فهرست ویژگی‌های نرم‌افزار
                  </h2>
                </div>
              </div>

              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="group relative"
                    style={{
                      transition: 'transform 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateX(-8px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <div 
                      className="relative rounded-2xl p-4"
                      style={{
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                      }}
                    >
                      <div className="flex gap-4 items-start">
                        <CheckCircleOutlined className="text-2xl text-green-400 flex-shrink-0 mt-1" />
                        <p 
                          className="text-lg text-gray-200 leading-relaxed"
                          style={{
                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                          }}
                        >
                          {feature}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Help Section */}
            <div className="lg:col-span-1 flex flex-col justify-end">
              <div className="text-center">
                <Link href="/#setup-guide">
                  <Button
                    type="default"
                    size="large"
                    icon={<BookOutlined />}
                    className="w-full"
                    style={{
                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#ffffff',
                      borderRadius: '16px',
                      height: '64px',
                      fontSize: '18px',
                      fontWeight: 'bold',
                    }}
                  >
                    مشاهده ویدیوهای آموزشی
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

