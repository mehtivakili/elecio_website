'use client';

import Image from 'next/image';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

export default function HeroSection() {
  return (
    <section id="home" className="relative w-full h-screen flex items-center justify-start overflow-hidden" style={{ marginTop: '0' }}>
      {/* Background Image */}
      <div className="absolute inset-0 z-0" style={{ top: 0 }}>
        <Image
          src="/landing/top.jpg"
          alt="CNC Industrial Monitoring"
          fill
          priority
          className="object-cover"
          quality={90}
        />
        {/* Light overlay for better text readability */}
        <div className="absolute inset-0 bg-black/15" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-4 md:px-8 lg:px-16" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', paddingTop: '80px', minHeight: '100vh' }}>
        <div className="max-w-2xl" dir="ltr" style={{ textAlign: 'left', direction: 'ltr' }}>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight" style={{ textAlign: 'left' }}>
            تجربه هوشمندسازی
            <br />
            <span className="text-blue-400">CNC ماشین‌آلات</span>
          </h1>
          
          <p className="text-base md:text-lg text-gray-200 mb-8 leading-relaxed max-w-2xl" dir="rtl" style={{ textAlign: 'right', direction: 'rtl', marginRight: 'auto', marginLeft: 0 }}>
            نسل جدید ارتباط با CNC دقیق و پایدار. دستگاه CNC شما آنلاین و هوشمند می‌شود. پایداری ارتباط، افزایش بهره‌وری.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4" style={{ justifyContent: 'flex-start' }}>
            <Button
              type="default"
              size="large"
              className="bg-transparent border-white text-white hover:bg-white/10 h-10 px-6 text-base"
            >
              اطلاعات بیشتر
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white/50 rounded-full" />
        </div>
      </div>
    </section>
  );
}

