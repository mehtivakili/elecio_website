'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

const controllers = [
  'Fanuc',
  'Heidenhain',
  'Siemens',
  'Mitsubishi',
  'Haas',
  'Charmilles',
];

const feature = {
  title: 'سازگاری کامل با تمام کنترولرها',
  description: '',
};

export default function DeviceFeaturesSection() {
  return (
    <section id="device-features" className="w-full py-24 relative overflow-hidden" dir="rtl">
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
            {/* Left Side - Feature */}
            <div className="p-8 md:p-12 lg:p-16">
              {/* Title */}
              <h2 
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
                style={{
                  letterSpacing: '0.5px',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                }}
              >
                ارتباط بی‌سیم پیشرفته
              </h2>
              
              <p className="text-lg text-gray-300 mb-12 leading-relaxed" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}>
                حذف کامل کابل‌کشی و لپتاپ و کامپیوتر و فلش USB. انتقال مستقیم فایل‌های NC از کامپیوتر طراحی به حافظه دستگاه از طریق Wi-Fi
              </p>
              
              {/* Main Feature */}
              <div className="mb-8">
                <h3 
                  className="text-xl font-bold mb-3 text-white"
                  style={{
                    textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  {feature.title}
                </h3>
                <p 
                  className="text-base text-gray-200 leading-relaxed mb-4"
                  style={{
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  {feature.description}
                </p>
                
                {/* Controllers List - 2 rows, 3 columns each */}
                <div className="grid grid-cols-3 gap-4 mt-6" dir="ltr" style={{ textAlign: 'left' }}>
                  {controllers.map((controller, index) => (
                    <div
                      key={index}
                      className="text-2xl md:text-3xl text-gray-200 flex items-start justify-start"
                      style={{
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                        direction: 'ltr',
                        textAlign: 'left',
                      }}
                    >
                      <span className="text-blue-400 mr-3 text-3xl md:text-4xl">•</span>
                      <span className="font-semibold">{controller}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - GIF Image */}
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
                className="relative w-full overflow-hidden"
                style={{ 
                  maxWidth: '800px',
                  width: '100%',
                  borderRadius: '16px',
                }}
              >
                <Image
                  src="/landing/support.gif"
                  alt="Wireless DNC Support"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                  unoptimized
                />
              </div>
            </div>
          </div>


          {/* More Info Button - Inside background */}
          <div className="text-center pb-8 px-8 md:px-12 lg:px-16">
            <Link href="/features">
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

