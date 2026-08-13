'use client';

import { Button } from 'antd';
import { MenuOutlined, DownOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Topbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('home');
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(true); // Default to true for SSR

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    // Check immediately
    if (typeof window !== 'undefined') {
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  const menuItems = [
    { key: 'home', label: 'خانه', href: '/' },
    { key: 'products', label: 'سفارش محصول', href: '/ordering' },
    { key: 'samples', label: 'نمونه کارها', href: '#' },
    { key: 'download', label: 'دانلود نرم‌افزار', href: '/download' },
    { key: 'guide', label: 'راهنمای استفاده', href: '/#setup-guide' },
    { key: 'about', label: 'درباره ما', href: '/about' },
    { key: 'contact', label: 'تماس با ما', href: '/#contact' },
  ];

  const landingSections = [
    {
      title: 'صفحه اصلی',
      items: [
        { key: 'home', label: 'شروع', href: '#home' },
        { key: 'customers', label: 'مشتریان ما', href: '#customers' },
      ],
    },
    {
      title: 'ویژگی‌های محصول',
      items: [
        { key: 'device-features', label: 'چرا ElecIO SMART DNC؟', href: '#device-features' },
        { key: 'wireless-features', label: 'ارتباط بی‌سیم پیشرفته', href: '#wireless-features' },
        { key: 'mobile-features', label: 'کارخانه در جیب شما', href: '#mobile-features' },
      ],
    },
    {
      title: 'قابلیت‌های نرم‌افزار',
      items: [
        { key: 'monitoring', label: 'مانیتورینگ و گزارش‌گیری', href: '#monitoring' },
        { key: 'file-management', label: 'مدیریت هوشمند فایل‌ها', href: '#file-management' },
      ],
    },
    {
      title: 'پشتیبانی',
      items: [
        { key: 'guarantee', label: 'گارانتی و پشتیبانی', href: '#guarantee' },
      ],
    },
  ];

  const handleScrollTo = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      const topbarHeight = 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - topbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
    setMobileMenuOpen(false);
  };

  const handleContactClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (pathname === '/') {
      // If we're on the home page, scroll to contact section
      handleScrollTo('#contact');
    } else {
      // If we're on another page, navigate to home and then scroll
      window.location.href = '/#contact';
    }
    setActiveItem('contact');
    setMobileMenuOpen(false);
  };

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionTitle)
        ? prev.filter((s) => s !== sectionTitle)
        : [...prev, sectionTitle]
    );
  };

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 1000,
        background: 'rgba(15, 15, 25, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '12px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        direction: 'ltr',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }}
    >
      {/* Left Side - Logo */}
      <div className="flex items-center gap-3">
        <Image
          src="/landing/logo-2.png"
          alt="ELEOO Logo"
          width={120}
          height={40}
          style={{
            objectFit: 'contain',
            height: 'auto',
          }}
          priority
        />
      </div>

      {/* Center - Navigation Menu */}
      <div
        className="hidden md:flex items-center gap-1"
        style={{
          background: 'rgba(139, 92, 246, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '6px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        }}
      >
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href === '/' && pathname === '/');
          const isContact = item.key === 'contact';
          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={isContact ? handleContactClick : () => setActiveItem(item.key)}
              style={{
                background: isActive 
                  ? 'rgba(139, 92, 246, 0.3)' 
                  : 'transparent',
                border: 'none',
                color: isActive 
                  ? '#ffffff' 
                  : 'rgba(255, 255, 255, 0.7)',
                padding: '8px 20px',
                borderRadius: '16px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: isActive ? 500 : 400,
                transition: 'all 0.2s ease',
                position: 'relative',
                textDecoration: 'none',
                display: 'inline-block',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                }
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Right Side - Buttons */}
      <div className="flex items-center gap-4">
        <Button
          type="text"
          style={{
            color: 'rgba(255, 255, 255, 0.8)',
            background: 'transparent',
            border: 'none',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: 400,
            borderRadius: '16px',
            transition: 'all 0.2s',
          }}
          className="hidden sm:inline-block hover:bg-white/5"
        >
          ورود
        </Button>

        {/* Mobile Menu Button - Right Corner */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMobileMenuOpen((prev) => !prev);
          }}
          style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            background: mobileMenuOpen ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '8px 12px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            minWidth: '40px',
            minHeight: '40px',
          }}
          onMouseEnter={(e) => {
            if (!mobileMenuOpen) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (!mobileMenuOpen) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }
          }}
        >
          <MenuOutlined style={{ fontSize: '20px' }} />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setMobileMenuOpen(false);
        }}
        style={{
          position: 'fixed',
          top: '80px',
          left: 0,
          right: 0,
          bottom: 0,
          background: mobileMenuOpen ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
          backdropFilter: mobileMenuOpen ? 'blur(4px)' : 'none',
          WebkitBackdropFilter: mobileMenuOpen ? 'blur(4px)' : 'none',
          zIndex: 9998,
          cursor: mobileMenuOpen ? 'pointer' : 'default',
          pointerEvents: mobileMenuOpen ? 'auto' : 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />

      {/* Mobile Menu Dropdown */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '80px',
          right: mobileMenuOpen ? 0 : '-100%',
          width: '85%',
          maxWidth: '400px',
          height: 'calc(100vh - 80px)',
          overflowY: 'auto',
          background: 'linear-gradient(180deg, rgba(15, 15, 25, 0.98) 0%, rgba(10, 10, 15, 0.98) 100%)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '24px 20px',
          boxShadow: '-8px 0 32px 0 rgba(0, 0, 0, 0.6)',
          zIndex: 9999,
          transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          direction: 'rtl',
        }}
      >
          {/* Main Menu Items */}
          <div style={{ marginBottom: '32px' }}>
            <div
              style={{
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.4)',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                marginBottom: '16px',
                padding: '0 4px',
                fontWeight: 600,
              }}
            >
              منوی اصلی
            </div>
            {menuItems.map((item) => {
              const isActive = pathname === item.href || (item.href === '/' && pathname === '/');
              const isContact = item.key === 'contact';
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={isContact ? handleContactClick : () => {
                    setActiveItem(item.key);
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    textAlign: 'right',
                    padding: '14px 16px',
                    color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.85)',
                    background: isActive 
                      ? 'linear-gradient(90deg, rgba(139, 92, 246, 0.25) 0%, rgba(139, 92, 246, 0.15) 100%)' 
                      : 'transparent',
                    border: isActive 
                      ? '1px solid rgba(139, 92, 246, 0.3)' 
                      : '1px solid transparent',
                    borderRight: isActive ? '3px solid rgba(139, 92, 246, 0.8)' : '3px solid transparent',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    marginBottom: '6px',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    fontWeight: isActive ? 600 : 400,
                    boxShadow: isActive 
                      ? '0 4px 12px rgba(139, 92, 246, 0.2)' 
                      : 'none',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'transparent';
                    }
                  }}
                >
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {isActive && (
                    <div
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: 'rgba(139, 92, 246, 0.8)',
                        boxShadow: '0 0 8px rgba(139, 92, 246, 0.6)',
                        marginRight: '8px',
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Landing Page Sections */}
          <div style={{ 
            borderTop: '1px solid rgba(255, 255, 255, 0.08)', 
            paddingTop: '24px',
            marginTop: '8px',
          }}>
            <div
              style={{
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.4)',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                marginBottom: '16px',
                padding: '0 4px',
                fontWeight: 600,
              }}
            >
              بخش‌های صفحه اصلی
            </div>
            {landingSections.map((section, sectionIndex) => (
              <div key={sectionIndex} style={{ marginBottom: '10px' }}>
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.title)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '14px 16px',
                    background: expandedSections.includes(section.title)
                      ? 'linear-gradient(90deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)'
                      : 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: 600,
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    marginBottom: '6px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)';
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    if (!expandedSections.includes(section.title)) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    }
                  }}
                >
                  <span>{section.title}</span>
                  <DownOutlined
                    style={{
                      transform: expandedSections.includes(section.title) ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.7)',
                    }}
                  />
                </button>

                {/* Section Items */}
                <div
                  style={{
                    maxHeight: expandedSections.includes(section.title) ? '500px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    paddingRight: '8px',
                    marginTop: '4px',
                  }}
                >
                  {section.items.map((item, itemIndex) => (
                    <button
                      key={item.key}
                      onClick={() => handleScrollTo(item.href)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        textAlign: 'right',
                        padding: '12px 20px',
                        color: 'rgba(255, 255, 255, 0.75)',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        marginBottom: '4px',
                        transition: 'all 0.2s',
                        opacity: expandedSections.includes(section.title) ? 1 : 0,
                        transform: expandedSections.includes(section.title) 
                          ? 'translateX(0)' 
                          : 'translateX(-10px)',
                        transitionDelay: `${itemIndex * 0.03}s`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.color = '#ffffff';
                        e.currentTarget.style.transform = 'translateX(-4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <span style={{ flex: 1 }}>{item.label}</span>
                      <div
                        style={{
                          width: '4px',
                          height: '4px',
                          borderRadius: '50%',
                          background: 'rgba(59, 130, 246, 0.6)',
                          marginRight: '8px',
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
    </header>
  );
}

