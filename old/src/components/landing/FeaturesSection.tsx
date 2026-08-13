'use client';

import { Card, Row, Col } from 'antd';
import { 
  DashboardOutlined, 
  ThunderboltOutlined, 
  CloudOutlined,
  BarChartOutlined 
} from '@ant-design/icons';

export default function FeaturesSection() {
  const features = [
    {
      icon: <DashboardOutlined className="text-4xl" />,
      title: 'نظارت لحظه‌ای',
      description: 'داده‌های زنده از تمام دستگاه‌های CNC خود را در یک داشبورد یکپارچه مشاهده کنید.',
    },
    {
      icon: <ThunderboltOutlined className="text-4xl" />,
      title: 'ارتباط پیشرفته',
      description: 'فناوری ارتباطی نسل جدید برای اتصال بی‌نقص دستگاه‌های صنعتی شما.',
    },
      {
      icon: <CloudOutlined className="text-4xl" />,
      title: 'صنعت ۴.۰',
      description: 'کارخانه خود را با آخرین فناوری‌های اینترنت اشیا و هوش مصنوعی به‌روز کنید.',
    },
    {
      icon: <BarChartOutlined className="text-4xl" />,
      title: 'تحلیل داده',
      description: 'با تحلیل‌های عمیق، تصمیم‌گیری‌های هوشمندانه‌تر بگیرید و بهره‌وری را افزایش دهید.',
    },
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900" dir="rtl">
      <div className="container mx-auto px-4 md:px-8 lg:px-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            ویژگی‌های کلیدی
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            راه‌حل جامع برای نظارت و مدیریت هوشمند دستگاه‌های CNC
          </p>
        </div>

        <Row gutter={[24, 24]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card
                hoverable
                className="h-full text-center"
                style={{
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                }}
              >
                <div className="text-blue-600 mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
}

