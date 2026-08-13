'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from 'antd';
import { FileTextOutlined, ArrowLeftOutlined } from '@ant-design/icons';

export default function FileManagementSection() {
  return (
    <section id="file-management" className="w-full py-24 relative overflow-hidden" dir="rtl">
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
            {/* Left Side - Content */}
            <div className="p-8 md:p-12 lg:p-16">
              {/* Icon */}


              {/* Title */}
              <h2 
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
                style={{
                  letterSpacing: '0.5px',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                }}
              >
                مدیریت هوشمند فایل‌ها و برنامه‌ها
              </h2>
              
              {/* Description */}
              <p 
                className="text-lg text-gray-200 leading-relaxed mb-4"
                style={{
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                }}
              >
                با سیستم پیشرفته مدیریت فایل، تمامی برنامه‌های NC خود را به‌صورت منظم سازماندهی کنید. امکان برچسب‌گذاری فایل‌ها با توضیحات اختصاصی به شما کمک می‌کند تا هر برنامه را به‌راحتی شناسایی و در گزارش‌ها ردگیری کنید.
              </p>
              <p 
                className="text-base text-gray-300 leading-relaxed"
                style={{
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                }}
              >
                <strong className="text-white">ارسال گروهی (Group NC Programs):</strong> چندین فایل را در یک گروه ارسال کنید تا اجرای متوالی برنامه‌ها به‌صورت خودکار انجام شود. این ویژگی، فرآیند ارسال و مدیریت برنامه‌ها را ساده‌تر کرده و بهره‌وری شما را افزایش می‌دهد.
              </p>
            </div>

            {/* Right Side - Image */}
            <div 
              className="relative flex items-center justify-center p-8 md:p-12 lg:p-16"
              style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.4) 0%, rgba(30, 41, 59, 0.4) 100%)',
              }}
            >
              {/* Glow behind image */}
              <div 
                className="absolute inset-0 blur-3xl opacity-30"
                style={{
                  background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
                }}
              />
              
              <div 
                className="relative w-full rounded-2xl overflow-hidden"
                style={{
                  aspectRatio: '16/9',
                  maxWidth: '800px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                }}
              >
                <Image
                  src="/landing/12.jpg"
                  alt="File Management Interface"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>

          {/* More Info Button - Inside background */}
          <div className="text-center pb-8 px-8 md:px-12 lg:px-16">
            <Link href="/file-management">
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

