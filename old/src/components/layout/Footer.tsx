'use client';

import { LinkedinOutlined, InstagramOutlined, SendOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import Link from 'next/link';

const socialLinks = [
  {
    icon: <LinkedinOutlined className="text-2xl" />,
    label: 'LinkedIn',
    url: 'https://www.linkedin.com/company/elecio',
  },
  {
    icon: <InstagramOutlined className="text-2xl" />,
    label: 'Instagram',
    url: 'https://www.instagram.com/Elecio_ir/',
  },
  {
    icon: <SendOutlined className="text-2xl" />,
    label: 'Telegram',
    url: 'https://t.me/elecio_shop',
  },
];

const contacts = [
  { type: 'email', value: 'info@elecio.ir', label: 'info@elecio.ir' },
  { type: 'phone', value: '09129152300', label: '09129152300 - مهندس مشایخ' },
  { type: 'phone', value: '09906400588', label: '09906400588 - مهندس ساکی' },
  /*{ type: 'phone', value: '09213179857', label: '09213179857 - مهندس وکیلی' },*/
];

export default function Footer() {
  return (
    <footer 
      id="contact"
      className="w-full py-16 relative border-t"
      style={{
        background: 'linear-gradient(180deg, rgba(15, 15, 25, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      }}
      dir="rtl"
    >
      <div className="container mx-auto px-4 md:px-8 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          {/* Social Links Section */}
          <div>
            <h3 
              className="text-2xl font-bold text-white mb-6"
              style={{
                textShadow: '0 2px 10px rgba(139, 92, 246, 0.3)',
              }}
            >
              لینک‌های کاربری
            </h3>
            <div className="flex flex-col gap-4">
              {socialLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group"
                  style={{
                    transition: 'transform 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(-5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-blue-400 group-hover:text-blue-300 transition-colors"
                    style={{
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                    }}
                  >
                    {link.icon}
                  </div>
                  <span className="text-gray-300 group-hover:text-white transition-colors">
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div>
            <h3 
              className="text-2xl font-bold text-white mb-6"
              style={{
                textShadow: '0 2px 10px rgba(139, 92, 246, 0.3)',
              }}
            >
              راه‌های ارتباطی ما
            </h3>
            <div className="flex flex-col gap-4">
              {contacts.map((contact, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3"
                >
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-blue-400"
                    style={{
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                    }}
                  >
                    {contact.type === 'email' ? (
                      <MailOutlined className="text-xl" />
                    ) : (
                      <PhoneOutlined className="text-xl" />
                    )}
                  </div>
                  {contact.type === 'email' ? (
                    <a
                      href={`mailto:${contact.value}`}
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      {contact.label}
                    </a>
                  ) : (
                    <a
                      href={`tel:${contact.value}`}
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      {contact.label}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div 
          className="pt-8 border-t text-center"
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <p className="text-gray-400 text-sm">
            enamd for elecio
          </p>
        </div>
      </div>
    </footer>
  );
}

