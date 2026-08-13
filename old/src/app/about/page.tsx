'use client';

import Image from 'next/image';
import { UserOutlined, RocketOutlined, ExperimentOutlined, ToolOutlined } from '@ant-design/icons';

export default function AboutPage() {
  return (
    <main className="w-full min-h-screen" dir="rtl">
      {/* Hero Section */}
      <section className="w-full py-24 relative overflow-hidden">
        {/* Background gradient effects */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 30% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
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
                <RocketOutlined className="text-3xl text-blue-400" />
              </div>
              <h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white"
                style={{
                  textShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
                  letterSpacing: '0.5px',
                }}
              >
                درباره ما
              </h1>
            </div>
            <div className="w-24 h-0.5 mx-auto bg-gradient-to-r from-transparent via-purple-500 to-transparent mb-8" />
            <p 
              className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
              style={{
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              }}
            >
              داستان شکل‌گیری و پیشرفت ElecIO SMART DNC
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="w-full py-16 relative">
        <div className="relative z-10 container mx-auto px-4 md:px-8 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
            {/* Left Side - Text Content */}
            <div className="space-y-8">
              {/* Paragraph 1 */}
              <div 
                className="p-8 rounded-3xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'rgba(139, 92, 246, 0.2)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                    }}
                  >
                    <RocketOutlined className="text-2xl text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">سفر سه‌ساله ما</h2>
                    <p className="text-lg text-gray-200 leading-relaxed">
                      بیش از سه سال است که تیم ما با عشق و علاقه روی پروژه ElecIO SMART DNC کار می‌کند. 
                      این محصول حاصل تلاش مستمر، خلاقیت بی‌پایان و کوشش بی‌وقفه ماست. ما هر روز این دستگاه را 
                      ارتقا دادیم، تست کردیم و بهبود بخشیدیم. با استفاده از خلاقیت و تیزبینی، هر مشکل را به 
                      فرصتی برای پیشرفت تبدیل کردیم. آزمون‌های متعدد و بررسی دقیق هر جزئیات، ما را به محصولی 
                      رساند که امروز به آن افتخار می‌کنیم.
                    </p>
                  </div>
                </div>
              </div>

              {/* Paragraph 2 */}
              <div 
                className="p-8 rounded-3xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                    }}
                  >
                    <ToolOutlined className="text-2xl text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">تجهیزات و تولیدات برتر</h2>
                    <p className="text-lg text-gray-200 leading-relaxed">
                      ما با استفاده از تجهیزات اسمبلی و تولیدات عالی و روز دنیا، محصولی را خلق کردیم که 
                      استانداردهای بین‌المللی را برآورده می‌کند. هر قطعه با دقت انتخاب شده و هر مرحله از 
                      تولید با نظارت دقیق انجام می‌شود. ما به کیفیت و دوام محصول خود ایمان داریم و این 
                      را در انتخاب مواد اولیه، فرآیند تولید و کنترل کیفیت نشان داده‌ایم. استفاده از تکنولوژی‌های 
                      پیشرفته و به‌روز، ما را قادر ساخته تا محصولی ارائه دهیم که نه تنها نیازهای امروز را 
                      برآورده می‌کند، بلکه برای آینده نیز آماده است.
                    </p>
                  </div>
                </div>
              </div>

              {/* Paragraph 3 */}
              <div 
                className="p-8 rounded-3xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'rgba(139, 92, 246, 0.2)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                    }}
                  >
                    <ExperimentOutlined className="text-2xl text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">تست و پیاده‌سازی گسترده</h2>
                    <p className="text-lg text-gray-200 leading-relaxed">
                      ElecIO SMART DNC روی دستگاه‌های بیشماری تست شده و در کارگاه‌های زیادی پیاده‌سازی شده است. 
                      این تجربه عملی به ما کمک کرده تا محصول را در شرایط واقعی بهبود بخشیم و اطمینان حاصل کنیم 
                      که در هر محیط کاری و با هر نوع دستگاه CNC عملکرد بهینه دارد. بازخوردهای ارزشمند مشتریان 
                      ما، راهنمای ما در مسیر پیشرفت بوده و هر نسخه جدید، حاصل یادگیری از تجربیات قبلی است. 
                      ما به این باور رسیده‌ایم که محصولی که امروز ارائه می‌دهیم، نتیجه سه سال کار مداوم، 
                      تست‌های فراوان و بهبودهای مستمر است.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Images Gallery */}
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 
                  className="text-3xl font-bold text-white mb-4"
                  style={{
                    textShadow: '0 2px 10px rgba(139, 92, 246, 0.3)',
                  }}
                >
                  روند پیشرفت محصول
                </h2>
                <p className="text-gray-300">از اولین نسخه تا امروز</p>
              </div>
              
              {[1, 2, 3, 4].map((num) => (
                <div
                  key={num}
                  className="relative rounded-2xl overflow-hidden group"
                  style={{
                    aspectRatio: '16/9',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(139, 92, 246, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.2)';
                  }}
                >
                  <Image
                    src={`/about/${num}.jpg`}
                    alt={`نسخه ${num} ElecIO SMART DNC`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div 
                    className="absolute bottom-0 left-0 right-0 p-4"
                    style={{
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
                    }}
                  >
                    <p className="text-white font-semibold text-lg">نسخه {num}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="w-full py-16 relative">
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
          }}
        />
        <div className="relative z-10 container mx-auto px-4 md:px-8 lg:px-16">
          <div className="text-center mb-12">
            <h2 
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{
                textShadow: '0 2px 10px rgba(139, 92, 246, 0.3)',
              }}
            >
              تیم سازنده
            </h2>
            <div className="w-24 h-0.5 mx-auto bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Engineer 1 */}
            <div 
              className="p-8 rounded-3xl text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(139, 92, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
                  border: '2px solid rgba(139, 92, 246, 0.3)',
                  boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)',
                }}
              >
                <UserOutlined className="text-4xl text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">مهندس مشایخ</h3>
              <p className="text-gray-300">صنایع گرمسار</p>
            </div>

            {/* Engineer 2 */}
            <div 
              className="p-8 rounded-3xl text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(139, 92, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
                  border: '2px solid rgba(139, 92, 246, 0.3)',
                  boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)',
                }}
              >
                <UserOutlined className="text-4xl text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">مهندس وکیلی</h3>
              <p className="text-gray-300">کنترل خواجه نصیر</p>
            </div>

            {/* Engineer 3 */}
            <div 
              className="p-8 rounded-3xl text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(139, 92, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
                  border: '2px solid rgba(139, 92, 246, 0.3)',
                  boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)',
                }}
              >
                <UserOutlined className="text-4xl text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">مهندس ساکی</h3>
              <p className="text-gray-300">مکاترونیک خواجه نصیر</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

