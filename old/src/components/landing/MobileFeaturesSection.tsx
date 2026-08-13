'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from 'antd';
import { MobileOutlined, BellOutlined, CloudUploadOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const features = [
  {
    icon: <MobileOutlined className="text-4xl" />,
    title: 'یکپارچگی کامل',
    description: 'اپلیکیشن موبایل (اندروید) و پنل تحت وب (ویندوز) با رابط کاربری هماهنگ. اسکنر هوشمند شبکه برای شناسایی خودکار دستگاه‌ها.',
  },
  {
    icon: <BellOutlined className="text-4xl" />,
    title: 'پایش لحظه‌ای و هشدار',
    description: 'دریافت نوتیفیکیشن فوری روی موبایل مدیر در صورت توقف غیر منتظره دستگاه. مانیتورینگ لحظه‌ای تمام عملیات.',
  },
  {
    icon: <CloudUploadOutlined className="text-4xl" />,
    title: 'مدیریت فایل از راه دور',
    description: 'ارسال مستقیم فایل NC از دفتر طراحی به حافظه دستگاه، بدون نیاز به حضور فیزیکی. تغییر Baud Rate بدون نیاز به ریستارت.',
  },
];

export default function MobileFeaturesSection() {
  return (
    <section id="mobile-features" className="w-full py-24 relative overflow-hidden" dir="rtl">
      <div className="relative z-10 container mx-auto px-4 md:px-8 lg:px-16">
        {/* Unified Container */}
        <div 
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(30, 41, 59, 0.7) 50%, rgba(15, 23, 42, 0.7) 100%)',
            backgroundImage: `
              linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(30, 41, 59, 0.7) 50%, rgba(15, 23, 42, 0.7) 100%),
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 20px,
                rgba(255, 255, 255, 0.02) 20px,
                rgba(255, 255, 255, 0.02) 21px
              ),
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 20px,
                rgba(255, 255, 255, 0.02) 20px,
                rgba(255, 255, 255, 0.02) 21px
              )
            `,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Glow effect */}
          <div 
            className="absolute inset-0 opacity-50"
            style={{
              background: 'radial-gradient(circle at top left, rgba(139, 92, 246, 0.2) 0%, transparent 50%)',
              pointerEvents: 'none',
            }}
          />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left Side - Features */}
            <div className="p-8 md:p-12 lg:p-16">
              {/* Title */}
              <h2 
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
                style={{
                  letterSpacing: '0.5px',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                }}
              >
                کارخانه در جیب شماست
              </h2>
              <p className="text-lg text-gray-300 mb-12 leading-relaxed" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}>
                اپلیکیشن ElecIO Manager برای ویندوز و اندروید با رابط کاربری هماهنگ. 
              </p>
              
              {/* Features List */}
              <div className="space-y-8">
                {features.map((feature, index) => (
                  <div 
                    key={index} 
                    className="flex gap-5 items-start group"
                    style={{
                      transition: 'transform 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateX(-5px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    {/* Icon with background */}
                    <div 
                      className="flex-shrink-0 w-20 h-20 relative rounded-xl p-3"
                      style={{
                        background: 'rgba(59, 130, 246, 0.2)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                      }}
                    >
                      <div className="text-blue-400 text-4xl flex items-center justify-center h-full">
                        {feature.icon}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 pt-1">
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
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Devices Image */}
            <div 
              className="relative flex items-center justify-center p-8 md:p-12 lg:p-16"
              style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.4) 0%, rgba(30, 41, 59, 0.4) 100%)',
              }}
            >
              {/* Glow behind devices */}
              <div 
                className="absolute inset-0 blur-3xl opacity-30"
                style={{
                  background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
                }}
              />
              
              <div className="relative w-full" style={{ minHeight: '500px' }}>
                <Image
                  src="/landing/devices.png"
                  alt="Mobile and Web Devices"
                  fill
                  className="object-contain"
                  priority
                  style={{
                    filter: 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3))',
                    borderRadius: '16px',
                  }}
                />
              </div>
            </div>
          </div>

          {/* More Info Button - Inside background */}
          <div className="text-center pb-8 px-8 md:px-12 lg:px-16">
            <Link href="/mobile">
              <Button
                type="default"
                size="large"
                icon={<ArrowLeftOutlined />}
                className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white/50 h-12 px-8 text-base"
              >
                اطلاعات بیشتر
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

