import type { DocumentBrand } from './cnc-documents';

export type ControllerBrandProfile = {
  id: DocumentBrand;
  name: string;
  logo: string;
  logoWidth: number;
  logoHeight: number;
  accent: string;
  taglineFa: string;
  taglineEn: string;
  descriptionFa: string;
  descriptionEn: string;
};

export const controllerBrandProfiles: ControllerBrandProfile[] = [
  { id: 'fanuc', name: 'FANUC', logo: '/images/documents/fanuc.svg', logoWidth: 200, logoHeight: 34, accent: '#f04438', taglineFa: 'سری‌های کلاسیک، i و نسل‌های Plus', taglineEn: 'Classic, i-series and Plus generations', descriptionFa: 'منوال‌های اپراتوری، پارامتر، اتصال و نگهداری کنترلرهای پراستفاده FANUC.', descriptionEn: 'Operator, parameter, connection and maintenance manuals for widely used FANUC controls.' },
  { id: 'heidenhain', name: 'HEIDENHAIN', logo: '/images/documents/heidenhain.svg', logoWidth: 1024, logoHeight: 126, accent: '#35b878', taglineFa: 'خانواده‌های TNC و iTNC برای ماشین‌کاری دقیق', taglineEn: 'TNC and iTNC families for precision machining', descriptionFa: 'راهنماهای Klartext، سیکل‌ها، DIN/ISO و راه‌اندازی کنترلرهای فرز و ماشین‌کاری دقیق.', descriptionEn: 'Klartext, cycles, DIN/ISO and setup guides for milling and precision machining controls.' },
  { id: 'siemens', name: 'SIEMENS', logo: '/images/documents/siemens.svg', logoWidth: 1000, logoHeight: 159, accent: '#18a9b4', taglineFa: 'SINUMERIK از 802D تا 840D sl', taglineEn: 'SINUMERIK from 802D through 840D sl', descriptionFa: 'کتابخانه نسل‌های قدیمی و جدید SINUMERIK برای تراش، فرز و اتوماسیون ماشین‌ابزار.', descriptionEn: 'Legacy and current SINUMERIK documentation for turning, milling and machine automation.' },
  { id: 'mitsubishi', name: 'MITSUBISHI', logo: '/images/documents/mitsubishi-electric.svg', logoWidth: 794, logoHeight: 242, accent: '#e33d3d', taglineFa: 'MELDAS سری M60 تا M800 و E80', taglineEn: 'MELDAS M60 through M800 and E80', descriptionFa: 'اسناد رسمی راهبری، برنامه‌نویسی، اتصال و آلارم کنترلرهای Mitsubishi CNC.', descriptionEn: 'Official operation, programming, connection and alarm documents for Mitsubishi CNCs.' },
  { id: 'haas', name: 'HAAS', logo: '/images/documents/haas.svg', logoWidth: 420, logoHeight: 180, accent: '#367de4', taglineFa: 'کنترل کلاسیک Haas و نسل جدید NGC', taglineEn: 'Classic Haas Control and NGC', descriptionFa: 'منوال‌های رسمی اپراتوری و سرویس برای کنترل کلاسیک و نسل جدید Haas.', descriptionEn: 'Official operator and service manuals for Classic Haas Control and NGC.' },
  { id: 'syntec', name: 'SYNTEC', logo: '/images/documents/syntec.svg', logoWidth: 420, logoHeight: 120, accent: '#1559a6', taglineFa: 'سری‌های ۶، ۲۱ و ۲۲ برای فرز، تراش و روتر', taglineEn: 'Series 6, 21 and 22 for mills, lathes and routers', descriptionFa: 'اسناد کاربردی کنترلرهای اقتصادی و پرکاربرد Syntec در ماشین‌های تایوانی و چینی.', descriptionEn: 'Practical documentation for Syntec controls used on Taiwanese and Chinese machines.' },
  { id: 'gsk', name: 'GSK', logo: '/images/documents/gsk.svg', logoWidth: 360, logoHeight: 120, accent: '#176fc1', taglineFa: 'سری‌های ۹۲۸ و ۹۸۰ برای تراش و فرز', taglineEn: '928 and 980 series for turning and milling', descriptionFa: 'راهنماهای اپراتوری، برنامه‌نویسی و PLC کنترلرهای GSK برای ماشین‌های اقتصادی.', descriptionEn: 'Operator, programming and PLC guides for cost-effective GSK-controlled machines.' },
  { id: 'fagor', name: 'FAGOR', logo: '/images/documents/fagor.svg', logoWidth: 420, logoHeight: 120, accent: '#ed1b2f', taglineFa: 'خانواده ۸۰۵۵ و نسل CNCelite', taglineEn: '8055 family and CNCelite generation', descriptionFa: 'اسناد مناسب رتروفیت، ماشین‌های اروپایی، بورینگ و کاربردهای خاص.', descriptionEn: 'Documentation for retrofits, European machines, boring mills and special applications.' },
  { id: 'mazak', name: 'MAZATROL', logo: '/images/documents/mazatrol.svg', logoWidth: 480, logoHeight: 120, accent: '#2456a6', taglineFa: 'Fusion 640، Matrix و Smooth', taglineEn: 'Fusion 640, Matrix and Smooth controls', descriptionFa: 'منابع کنترل‌های اختصاصی Mazak با برنامه‌نویسی مکالمه‌ای MAZATROL و EIA/ISO.', descriptionEn: 'Resources for Mazak controls with conversational MAZATROL and EIA/ISO programming.' },
];

export function getControllerBrand(brand: string) {
  return controllerBrandProfiles.find((item) => item.id === brand);
}
