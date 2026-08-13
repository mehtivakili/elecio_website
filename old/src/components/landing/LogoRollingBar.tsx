'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useMemo } from 'react';

const logos = [
  { 
    src: '/collab/parstechno.jpg', 
    alt: 'Pars Techno',
    name: 'گروه صنعتی پارس تکنو - اصلانی',
    url: null
  },
  { 
    src: '/collab/PIM.png', 
    alt: 'PIM',
    name: 'صنعت مهر پویا - قربانی',
    url: 'https://smp-mt.ir'
  },
  { 
    src: '/collab/sanatpazhohan.png', 
    alt: 'Sanat Pazhohan',
    name: 'صنعت پژوهان پارسه - محتشم',
    url: 'https://sanatpazhoohan.ir'
  },
  { 
    src: '/collab/TS.png', 
    alt: 'TS',
    name: 'تکنو صنعت علیزادگان',
    url: 'https://alizadehgan.com/'
  },
];

export default function LogoRollingBar() {
  // Duplicate logos for seamless infinite scroll - memoized for performance
  const duplicatedLogos = useMemo(() => [...logos, ...logos], []);

  return (
    <section id="customers" className="w-full py-16 relative" dir="rtl">
      {/* Background with glassmorphism - optimized */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(15, 15, 25, 0.6) 0%, rgba(15, 15, 25, 0.4) 100%)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          willChange: 'auto',
        }}
      />
      
      {/* Top border glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      <div className="relative z-10 container mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 
            className="text-2xl md:text-3xl font-bold text-white mb-2"
            style={{
              textShadow: '0 2px 20px rgba(139, 92, 246, 0.3)',
              letterSpacing: '0.5px',
            }}
          >
        کارگاه‌های تجهیزشده
          </h2>
          <div className="w-24 h-0.5 mx-auto bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
        </div>

        {/* Logo Scrolling Container */}
        <div className="relative overflow-hidden rounded-2xl" style={{ direction: 'ltr' }}>
          {/* Enhanced gradient overlays */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-40 z-10 pointer-events-none"
            style={{
              background: 'linear-gradient(to right, rgba(15, 15, 25, 0.95) 0%, rgba(15, 15, 25, 0.5) 50%, transparent 100%)',
            }}
          />
          <div 
            className="absolute right-0 top-0 bottom-0 w-40 z-10 pointer-events-none"
            style={{
              background: 'linear-gradient(to left, rgba(15, 15, 25, 0.95) 0%, rgba(15, 15, 25, 0.5) 50%, transparent 100%)',
            }}
          />
          
          {/* Inner glow container */}
          <div 
            className="py-8 px-4"
            style={{
              background: 'rgba(139, 92, 246, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div 
              className="flex animate-scroll"
              style={{
                willChange: 'transform',
                transform: 'translateZ(0)',
              }}
            >
              {duplicatedLogos.map((logo, index) => (
                <div
                  key={`${logo.src}-${index}`}
                  className="flex-shrink-0 mx-8 flex flex-col items-center justify-center"
                  style={{ 
                    minWidth: '280px',
                    contain: 'layout style paint',
                  }}
                >
                  <div 
                    className="relative w-full h-24 grayscale hover:grayscale-0 opacity-40 hover:opacity-100 p-4 rounded-xl mb-3"
                    style={{
                      filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2))',
                      transition: 'opacity 0.3s ease, filter 0.3s ease',
                      willChange: 'opacity, filter',
                      transform: 'translateZ(0)',
                    }}
                  >
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      fill
                      className="object-contain"
                      sizes="200px"
                      loading="lazy"
                      quality={75}
                    />
                    {/* Hover glow effect - optimized */}
                    <div 
                      className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100"
                      style={{
                        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)',
                        boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
                        transition: 'opacity 0.3s ease',
                        willChange: 'opacity',
                        pointerEvents: 'none',
                      }}
                    />
                  </div>
                  {/* Company Name */}
                  <div className="text-center px-2">
                    {logo.url ? (
                      <a
                        href={logo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/70 hover:text-white transition-colors duration-300 text-sm font-medium block"
                        style={{
                          textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                        }}
                      >
                        {logo.name}
                        <span className="inline-block mr-1 text-xs opacity-60">↗</span>
                      </a>
                    ) : (
                      <span
                        className="text-white/70 text-sm font-medium block"
                        style={{
                          textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                        }}
                      >
                        {logo.name}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* More Info Button - Inside background */}
        <div className="text-center mt-12 px-4">
          <Link href="/customers">
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
    </section>
  );
}

