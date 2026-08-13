'use client';

import { useEffect, useState } from 'react';
import { UserOutlined, ToolOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';

interface StatItem {
  icon: React.ReactNode;
  value: string;
  label: string;
  suffix?: string;
  color: string;
  iconColor: string;
}

const stats: StatItem[] = [
  {
    icon: <UserOutlined className="text-4xl" />,
    value: '150',
    label: 'مشتریان راضی',
    suffix: '+',
    color: 'rgba(59, 130, 246, 0.2)',
    iconColor: '#3b82f6',
  },
  {
    icon: <ToolOutlined className="text-4xl" />,
    value: '450',
    label: 'دستگاه‌های فعال',
    suffix: '+',
    color: 'rgba(139, 92, 246, 0.2)',
    iconColor: '#8b5cf6',
  },
  {
    icon: <ClockCircleOutlined className="text-4xl" />,
    value: '2.5',
    label: 'میلیون ساعت',
    suffix: '+',
    color: 'rgba(34, 197, 94, 0.2)',
    iconColor: '#22c55e',
  },
  {
    icon: <CheckCircleOutlined className="text-4xl" />,
    value: '99.8',
    label: 'درصد رضایت',
    suffix: '%',
    color: 'rgba(251, 191, 36, 0.2)',
    iconColor: '#fbbf24',
  },
];

export default function StatsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedValues, setAnimatedValues] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    const element = document.getElementById('stats-section');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      stats.forEach((stat, index) => {
        const numericValue = parseFloat(stat.value);
        const duration = 2000;
        const steps = 60;
        const increment = numericValue / steps;
        let current = 0;

        const timer = setInterval(() => {
          current += increment;
          if (current >= numericValue) {
            current = numericValue;
            clearInterval(timer);
          }
          setAnimatedValues((prev) => ({
            ...prev,
            [index]: current,
          }));
        }, duration / steps);
      });
    }
  }, [isVisible]);

  return (
    <section id="stats-section" className="w-full py-20 relative overflow-hidden" dir="rtl">
      {/* Background Effects */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(15, 15, 25, 0.4) 0%, rgba(15, 15, 25, 0.6) 50%, rgba(15, 15, 25, 0.4) 100%)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
      />
      
      {/* Animated Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Glow Effects */}
      <div 
        className="absolute top-0 left-1/4 w-96 h-96 blur-3xl opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
        }}
      />
      <div 
        className="absolute bottom-0 right-1/4 w-96 h-96 blur-3xl opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 container mx-auto px-4 md:px-8 lg:px-16">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
            style={{
              textShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
              letterSpacing: '0.5px',
            }}
          >
            آمار و عملکرد
          </h2>
          <div className="w-32 h-1 mx-auto bg-gradient-to-r from-transparent via-purple-500 to-transparent rounded-full" />
          <p className="text-lg text-gray-300 mt-6 max-w-2xl mx-auto">
            اعداد و ارقامی که نشان‌دهنده اعتماد و رضایت مشتریان ماست
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative"
              style={{
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                opacity: isVisible ? 1 : 0,
                transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`,
              }}
            >
              <div
                className="relative rounded-2xl p-6 md:p-8 h-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.6) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 16px 48px rgba(139, 92, 246, 0.4)';
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                {/* Glow Effect */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle, ${stat.color} 0%, transparent 70%)`,
                    filter: 'blur(20px)',
                    pointerEvents: 'none',
                  }}
                />

                {/* Icon */}
                <div className="relative z-10 mb-6 flex justify-center">
                  <div
                    className="w-20 h-20 rounded-xl flex items-center justify-center"
                    style={{
                      background: stat.color,
                      border: `1px solid ${stat.color.replace('0.2', '0.4')}`,
                      boxShadow: `0 8px 24px ${stat.color}`,
                    }}
                  >
                    <div style={{ color: stat.iconColor }}>
                      {stat.icon}
                    </div>
                  </div>
                </div>

                {/* Value */}
                <div className="relative z-10 text-center">
                  <div
                    className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2"
                    style={{
                      background: 'linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      textShadow: '0 4px 20px rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    {isVisible && animatedValues[index] !== undefined
                      ? stat.suffix === '%'
                        ? animatedValues[index].toFixed(1)
                        : Math.floor(animatedValues[index]).toLocaleString('fa-IR')
                      : '0'}
                    {stat.suffix && (
                      <span className="text-2xl md:text-3xl" style={{ opacity: 0.8 }}>
                        {stat.suffix}
                      </span>
                    )}
                  </div>

                  {/* Label */}
                  <p
                    className="text-base md:text-lg text-gray-300 font-medium"
                    style={{
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    {stat.label}
                  </p>
                </div>

                {/* Decorative Line */}
                <div
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 group-hover:w-3/4 transition-all duration-500 h-1 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${stat.color.replace('0.2', '0.8')}, transparent)`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

