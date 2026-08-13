'use client';

import Link from 'next/link';
import { Button } from 'antd';
import { CheckCircleOutlined, SafetyOutlined, CustomerServiceOutlined, SyncOutlined, ToolOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const benefits = [
  {
    icon: <SafetyOutlined className="text-3xl" />,
    title: '12 ماه گارانتی',
    description: 'بدون نگرانی از خرابی، با خیال راحت استفاده کنید',
  },
  {
    icon: <CustomerServiceOutlined className="text-3xl" />,
    title: 'پشتیبانی فنی سریع و پاسخگو',
    description: 'هر زمان که نیاز داشتید، ما همراه شما هستیم',
  },
  {
    icon: <SyncOutlined className="text-3xl" />,
    title: 'آپدیت‌های رایگان نرم‌افزار',
    description: 'همیشه به‌روز، همیشه بهینه',
  },
  {
    icon: <ToolOutlined className="text-3xl" />,
    title: 'امکان سفارشی‌سازی دستگاه',
    description: 'با توجه به نیاز سازمان‌ها، قابلیت تغییر و بهینه‌سازی اختصاصی را ارائه می‌دهیم',
  },
];

export default function GuaranteeSection() {
  return (
    <section id="guarantee" className="w-full py-24 relative overflow-hidden" dir="rtl">
      {/* Background gradient effects */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 30% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
        }}
      />
      
      <div className="relative z-10 container mx-auto px-4 md:px-8 lg:px-16">
        <div className="text-center mb-16">
          {/* Main Title */}
          <div className="inline-flex items-center gap-3 mb-6">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)',
              }}
            >
              <SafetyOutlined className="text-3xl text-blue-400" />
            </div>
            <h2 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white"
              style={{
                textShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
                letterSpacing: '0.5px',
              }}
            >
              گارانتی واقعی
            </h2>
          </div>
          
          <div className="inline-flex items-center gap-3 mb-8">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
              }}
            >
              <CustomerServiceOutlined className="text-3xl text-blue-400" />
            </div>
            <h2 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white"
              style={{
                textShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
                letterSpacing: '0.5px',
              }}
            >
              پشتیبانی همیشگی
            </h2>
          </div>

          {/* Description */}
          <p 
            className="text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed mb-12"
            style={{
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            }}
          >
            ElecIO SMART DNC با 12 ماه گارانتی واقعی ارائه می‌شود، زیرا به کیفیت و عملکرد آن اطمینان داریم. علاوه بر این، تیم پشتیبانی ما همیشه کنار شماست تا در هر مرحله از نصب، استفاده و بهینه‌سازی، راهنمایی‌های لازم را ارائه دهد.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group relative"
              style={{
                transition: 'transform 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div 
                className="relative rounded-2xl p-6 h-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                }}
              >
                {/* Glow effect on hover */}
                <div 
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)',
                    pointerEvents: 'none',
                  }}
                />
                
                <div className="relative z-10 flex gap-4 items-start">
                  {/* Check icon */}
                  <div className="flex-shrink-0">
                    <CheckCircleOutlined className="text-2xl text-green-400" />
                  </div>
                  
                  {/* Icon */}
                  <div 
                    className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                    }}
                  >
                    <div className="text-blue-400">
                      {benefit.icon}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <h3 
                      className="text-xl font-bold mb-2 text-white group-hover:text-blue-300 transition-colors"
                      style={{
                        textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                      }}
                    >
                      {benefit.title}
                    </h3>
                    <p 
                      className="text-base text-gray-300 leading-relaxed"
                      style={{
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                      }}
                    >
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* More Info Button - Outside background (with white border) */}
        <div className="text-center mt-16">
          <Link href="/guarantee">
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

