'use client';

import { useState } from 'react';
import { 
  ShoppingCartOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  EnvironmentOutlined,
  UserOutlined,
  MessageOutlined,
  SendOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { Button, Form, Input, message, Card } from 'antd';
import Link from 'next/link';

const contactInfo = {
  email: 'info@elecio.ir',
  phone: [
    { name: 'مهندس وکیلی', number: '09213179857', link: 'tel:+989213179857' },
    { name: 'مهندس ساکی', number: '09906400588', link: 'tel:+989906400588' },
    { name: 'مهندس مشایخ', number: '09129152300', link: 'tel:+989129152300' },
  ],
  address: 'تهران، شهرقدس، بلوار 30متری شهدا، خیابان ساحل، کوچه اشکان، پلاک 25',
  orderLink: 'https://elecio.ir/order/product/elecio-smart-dnc-g1/',
};

export default function OrderPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // Here you can add your form submission logic
      // For example, send to an API endpoint
      console.log('Form values:', values);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      message.success('درخواست شما با موفقیت ثبت شد. در اسرع وقت با شما تماس خواهیم گرفت.');
      form.resetFields();
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      message.error('خطایی در ارسال درخواست رخ داد. لطفاً دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen" dir="rtl">
      {/* Hero Section */}
      <section className="relative w-full py-24 md:py-32 overflow-hidden">
        {/* Background gradient effects */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 30% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
          }}
        />
        
        <div className="relative z-10 container mx-auto px-4 md:px-8 lg:px-16">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-6">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)',
                }}
              >
                <ShoppingCartOutlined className="text-3xl text-blue-400" />
              </div>
              <h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white"
                style={{
                  textShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
                  letterSpacing: '0.5px',
                }}
              >
                سفارش محصول
              </h1>
            </div>
            <p 
              className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed"
              style={{
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              }}
            >
              برای سفارش دستگاه ElecIO SMART DNC می‌توانید از طریق فرم زیر درخواست خود را ثبت کنید یا مستقیماً با ما تماس بگیرید.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative w-full py-12 pb-24">
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 30% 50%, rgba(139, 92, 246, 0.05) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)',
          }}
        />
        
        <div className="relative z-10 container mx-auto px-4 md:px-8 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card
                className="w-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                  borderRadius: '24px',
                }}
              >
                <div className="mb-8">
                  <h2 
                    className="text-2xl md:text-3xl font-bold text-white mb-4"
                    style={{
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    ثبت درخواست سفارش
                  </h2>
                  <p className="text-gray-300">
                    لطفاً اطلاعات خود را وارد کنید تا در اسرع وقت با شما تماس بگیریم.
                  </p>
                </div>

                {submitted && (
                  <div 
                    className="mb-6 p-4 rounded-2xl flex items-center gap-3"
                    style={{
                      background: 'rgba(34, 197, 94, 0.2)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                    }}
                  >
                    <CheckCircleOutlined className="text-2xl text-green-400" />
                    <p className="text-green-300">
                      درخواست شما با موفقیت ثبت شد. در اسرع وقت با شما تماس خواهیم گرفت.
                    </p>
                  </div>
                )}

                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  size="large"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Form.Item
                      name="name"
                      label={<span className="text-gray-200">نام و نام خانوادگی</span>}
                      rules={[{ required: true, message: 'لطفاً نام خود را وارد کنید' }]}
                    >
                      <Input
                        prefix={<UserOutlined className="text-blue-400" />}
                        placeholder="نام و نام خانوادگی"
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          color: '#ffffff',
                        }}
                        className="placeholder:text-gray-500"
                      />
                    </Form.Item>

                    <Form.Item
                      name="phone"
                      label={<span className="text-gray-200">شماره تماس</span>}
                      rules={[
                        { required: true, message: 'لطفاً شماره تماس خود را وارد کنید' },
                        { pattern: /^[0-9]{11}$/, message: 'شماره تماس باید 11 رقم باشد' }
                      ]}
                    >
                      <Input
                        prefix={<PhoneOutlined className="text-blue-400" />}
                        placeholder="09123456789"
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          color: '#ffffff',
                        }}
                        className="placeholder:text-gray-500"
                      />
                    </Form.Item>
                  </div>

                  <Form.Item
                    name="email"
                    label={<span className="text-gray-200">ایمیل (اختیاری)</span>}
                    rules={[
                      { type: 'email', message: 'ایمیل معتبر نیست' }
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined className="text-blue-400" />}
                      placeholder="example@email.com"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        color: '#ffffff',
                      }}
                      className="placeholder:text-gray-500"
                    />
                  </Form.Item>

                  <Form.Item
                    name="company"
                    label={<span className="text-gray-200">نام شرکت یا کارگاه (اختیاری)</span>}
                  >
                    <Input
                      placeholder="نام شرکت یا کارگاه"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        color: '#ffffff',
                      }}
                      className="placeholder:text-gray-500"
                    />
                  </Form.Item>

                  <Form.Item
                    name="message"
                    label={<span className="text-gray-200">پیام یا توضیحات (اختیاری)</span>}
                  >
                    <Input.TextArea
                      rows={5}
                      placeholder="در صورت نیاز، توضیحات یا سوالات خود را اینجا بنویسید..."
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        color: '#ffffff',
                      }}
                      className="placeholder:text-gray-500"
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      icon={<SendOutlined />}
                      size="large"
                      className="w-full"
                      style={{
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.8) 0%, rgba(59, 130, 246, 0.8) 100%)',
                        border: 'none',
                        borderRadius: '16px',
                        height: '56px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)',
                      }}
                    >
                      ارسال درخواست
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-6">
              {/* Direct Order Link */}
              <Card
                className="w-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                  borderRadius: '24px',
                }}
              >
                <div className="text-center">
                  <h3 
                    className="text-xl font-bold text-white mb-4"
                    style={{
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    سفارش آنلاین
                  </h3>
                  <p className="text-gray-300 mb-6">
                    برای سفارش مستقیم از طریق فروشگاه آنلاین
                  </p>
                  <Link href={contactInfo.orderLink} target="_blank" rel="noopener noreferrer">
                    <Button
                      type="primary"
                      size="large"
                      icon={<ShoppingCartOutlined />}
                      className="w-full"
                      style={{
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.8) 0%, rgba(59, 130, 246, 0.8) 100%)',
                        border: 'none',
                        borderRadius: '16px',
                        height: '56px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)',
                      }}
                    >
                      رفتن به فروشگاه
                    </Button>
                  </Link>
                </div>
              </Card>

              {/* Contact Info */}
              <Card
                className="w-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                  borderRadius: '24px',
                }}
              >
                <h3 
                  className="text-xl font-bold text-white mb-6"
                  style={{
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  اطلاعات تماس
                </h3>

                <div className="space-y-6">
                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'rgba(59, 130, 246, 0.2)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                      }}
                    >
                      <MailOutlined className="text-2xl text-blue-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">ایمیل</p>
                      <a 
                        href={`mailto:${contactInfo.email}`}
                        className="text-white hover:text-blue-400 transition-colors"
                      >
                        {contactInfo.email}
                      </a>
                    </div>
                  </div>

                  {/* Phone Numbers */}
                  {contactInfo.phone.map((contact, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: 'rgba(59, 130, 246, 0.2)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                        }}
                      >
                        <PhoneOutlined className="text-2xl text-blue-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm mb-1">{contact.name}</p>
                        <a 
                          href={contact.link}
                          className="text-white hover:text-blue-400 transition-colors"
                        >
                          {contact.number}
                        </a>
                      </div>
                    </div>
                  ))}

                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'rgba(59, 130, 246, 0.2)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                      }}
                    >
                      <EnvironmentOutlined className="text-2xl text-blue-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">آدرس</p>
                      <p className="text-white text-sm leading-relaxed">
                        {contactInfo.address}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

