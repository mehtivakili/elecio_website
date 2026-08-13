'use client';

import { useState, useEffect } from 'react';
import { PlayCircleOutlined, BookOutlined } from '@ant-design/icons';

// Array of Aparat video IDs for setup guides
const setupVideos = [
  {
    id: 'jjs4noq',
    title: 'آموزش فعال سازی حالت خواب دستگاه ElecIO SMART DNC',
  },
  {
    id: 'qsni3zt',
    title: 'آموزش تنظیم پارامترهای پورت سریال در ElecIO SMART DNC',
  },
  {
    id: 'luf0dg1',
    title: 'آموزش ارسال فایل NC به دستگاه ElecIO SMART DNC',
  },
  {
    id: 'luv0427',
    title: 'آموزش راه‌اندازی اولیه دستگاه ElecIO SMART DNC از طریق WiFi',
  },
  {
    id: 'lgy762o',
    title: 'آموزش راه‌اندازی اولیه دستگاه ElecIO SMART DNC از طریق SD Reader',
  },
  {
    id: 'axc9326',
    title: 'آموزش نصب و راه‌اندازی نرم افزار Elecio Manager',
  },
];

// Helper function to extract video ID from Aparat URL
const extractAparatVideoId = (urlOrId: string): string => {
  if (!urlOrId.includes('aparat.com')) {
    return urlOrId;
  }
  const match = urlOrId.match(/aparat\.com\/v\/([^\/\?]+)/);
  return match ? match[1] : urlOrId;
};

// Helper function to get Aparat embed URL
const getAparatEmbedUrl = (videoId: string): string => {
  const cleanId = extractAparatVideoId(videoId);
  return `https://www.aparat.com/video/video/embed/videohash/${cleanId}/vt/frame`;
};

// Helper function to get Aparat thumbnail URL
const getAparatThumbnail = (videoId: string): string => {
  const cleanId = extractAparatVideoId(videoId);
  return `https://www.aparat.com/public/public/user_data/video/video_square/${cleanId}.jpg`;
};

// Alternative thumbnail formats as fallback
const getAparatThumbnailAlternatives = (videoId: string): string[] => {
  const cleanId = extractAparatVideoId(videoId);
  return [
    `https://www.aparat.com/public/public/user_data/video/video_square/${cleanId}.jpg`,
    `https://www.aparat.com/public/public/user_data/video/video/${cleanId}.jpg`,
    `https://www.aparat.com/public/public/user_data/video/video_thumb/${cleanId}.jpg`,
  ];
};

export default function SetupGuideSection() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [loadedThumbnails, setLoadedThumbnails] = useState<Set<string>>(new Set());

  // Add Aparat embed styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .h_iframe-aparat_embed_frame {
        position: relative;
      }
      .h_iframe-aparat_embed_frame .ratio {
        display: block;
        width: 100%;
        height: auto;
      }
      .h_iframe-aparat_embed_frame iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <section id="setup-guide" className="w-full py-24 relative overflow-hidden" dir="rtl">
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

            <h2 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white"
              style={{
                textShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
                letterSpacing: '0.5px',
              }}
            >
              آموزش راه‌اندازی
            </h2>
          </div>

          {/* Description */}
          <p 
            className="text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed mb-12"
            style={{
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            }}
          >
            در این بخش می‌توانید ویدیوهای آموزشی مربوط به راه‌اندازی، نصب و استفاده از دستگاه ElecIO SMART DNC را مشاهده کنید.
          </p>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {setupVideos.map((video, index) => (
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
                className="relative rounded-2xl overflow-hidden"
                style={{
                  aspectRatio: '16/9',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedVideo(video.id)}
              >
                {/* Video Thumbnail */}
                <div className="relative w-full h-full">
                  {!loadedThumbnails.has(video.id) && (
                    <div 
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
                      }}
                    >
                      <div className="text-gray-400 text-sm">در حال بارگذاری...</div>
                    </div>
                  )}
                  <img
                    src={getAparatThumbnail(video.id)}
                    alt={video.title}
                    className="w-full h-full object-cover"
                    style={{
                      opacity: loadedThumbnails.has(video.id) ? 1 : 0,
                      transition: 'opacity 0.3s ease',
                    }}
                    loading="lazy"
                    onLoad={() => {
                      setLoadedThumbnails(prev => new Set(prev).add(video.id));
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      const alternatives = getAparatThumbnailAlternatives(video.id);
                      const currentSrc = target.src;
                      const currentIndex = alternatives.findIndex(url => url === currentSrc);
                      
                      if (currentIndex < alternatives.length - 1) {
                        target.src = alternatives[currentIndex + 1];
                      } else {
                        target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360"%3E%3Crect fill="%23334155" width="640" height="360"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239CA3AF" font-family="Arial" font-size="24"%3Eویدیو آپارات%3C/text%3E%3C/svg%3E';
                        setLoadedThumbnails(prev => new Set(prev).add(video.id));
                      }
                    }}
                  />
                  
                  {/* Overlay with play button */}
                  <div 
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.4) 100%)',
                    }}
                  >
                    <div 
                      className="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                      style={{
                        background: 'rgba(59, 130, 246, 0.9)',
                        boxShadow: '0 8px 24px rgba(59, 130, 246, 0.5)',
                      }}
                    >
                      <PlayCircleOutlined className="text-4xl text-white" style={{ marginLeft: '4px' }} />
                    </div>
                  </div>

                  {/* Video Title */}
                  <div 
                    className="absolute bottom-0 left-0 right-0 p-4"
                    style={{
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
                    }}
                  >
                    <h3 
                      className="text-lg font-bold text-white"
                      style={{
                        textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
                      }}
                    >
                      {video.title}
                    </h3>
                  </div>
                </div>

                {/* Glow effect on hover */}
                <div 
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(10px)',
          }}
          onClick={() => setSelectedVideo(null)}
        >
          <div 
            className="relative w-full max-w-4xl h_iframe-aparat_embed_frame"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute -top-12 right-0 text-white text-2xl hover:text-blue-400 transition-colors z-10"
              style={{
                zIndex: 10,
              }}
            >
              ✕
            </button>

            {/* Video iframe with Aparat responsive wrapper */}
            <span style={{ display: 'block', paddingTop: '57%' }}></span>
            <iframe
              src={getAparatEmbedUrl(selectedVideo)}
              className="rounded-2xl"
              style={{
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)',
              }}
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        </div>
      )}
    </section>
  );
}


