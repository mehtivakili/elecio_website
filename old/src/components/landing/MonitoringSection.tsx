'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from 'antd';
import { MonitorOutlined, ArrowLeftOutlined } from '@ant-design/icons';

export default function MonitoringSection() {
  return (
    <section id="monitoring" className="w-full py-24 relative overflow-hidden" dir="rtl">
      <div className="relative z-10 container mx-auto px-4 md:px-8 lg:px-16">
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div>
              {/* Icon */}
 

              {/* Title */}
              <h2 
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
                style={{
                  letterSpacing: '0.5px',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                }}
              >
                مانیتورینگ و گزارش‌گیری دقیق خط تولید
              </h2>
              
              {/* Description */}
              <p 
                className="text-lg text-gray-200 leading-relaxed mb-4"
                style={{
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                }}
              >
                با قابلیت مانیتورینگ لحظه‌ای، تمامی مراحل ارسال برنامه‌های NC به ماشین را در زمان واقعی مشاهده و کنترل کنید. نمایش جزئیات دقیق انتقال داده و وضعیت ارتباط به شما امکان می‌دهد تا بدون وقفه بر عملکرد دستگاه نظارت داشته باشید.
              </p>
              <p 
                className="text-base text-gray-300 leading-relaxed"
                style={{
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                }}
              >
                <strong className="text-white">محاسبه زمان خواب دستگاه:</strong> شناسایی دقیق زمان‌های توقف غیرمنتظره و افزایش بهره‌وری خط تولید. هرگونه خطا را سریعاً شناسایی و برطرف کنید.
              </p>
            </div>

          {/* Right Side - Images */}
          <div className="relative flex items-center justify-center gap-4">
            <div className="relative grid grid-cols-1 gap-6 w-full max-w-2xl">
                {/* Image 1 */}
                <div 
                  className="relative w-full rounded-2xl overflow-hidden"
                  style={{
                    aspectRatio: '16/9',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                  }}
                >
                  <Image
                    src="/landing/1.jpg"
                    alt="Monitoring Screen 1"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>

                {/* Image 1n */}
                <div 
                  className="relative w-full rounded-2xl overflow-hidden"
                  style={{
                    aspectRatio: '16/9',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                  }}
                >
                  <Image
                    src="/landing/1n.jpg"
                    alt="Monitoring Screen 2"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
            </div>
          </div>

        </div>

        {/* More Info Button - Outside background (with white border) */}
        <div className="text-center mt-12">
          <Link href="/monitoring">
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
      </div>
    </section>
  );
}

