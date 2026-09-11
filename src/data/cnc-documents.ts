export type DocumentKind = 'operator' | 'maintenance' | 'parameter' | 'connection' | 'programming' | 'diagnostics' | 'reference';
export type DocumentAccess = 'direct' | 'library' | 'portal' | 'archive';
export type DocumentBrand = 'fanuc' | 'heidenhain' | 'siemens' | 'mitsubishi' | 'haas';

export type CncDocument = {
  title: string;
  kind: DocumentKind;
  documentNumber?: string;
  revision?: string;
  language: string;
  url: string;
  access: DocumentAccess;
  officialUrl?: string;
};

export type ControllerDocumentGroup = {
  id: string;
  brand: DocumentBrand;
  brandLabel: string;
  model: string;
  descriptionFa: string;
  descriptionEn: string;
  documents: CncDocument[];
};

const FANUC_PORTAL = 'https://myportal.fanucamerica.com/';
const HEIDENHAIN_LIBRARY = 'https://www.heidenhain.com/service/downloads/documentation';
const SIEMENS_COLLECTION = 'https://support.industry.siemens.com/cs/attachments/85291197/TOC_UMC_1013.pdf';
const FANUC_ARCHIVE_URLS: Record<string, string> = {
  'B-61404E': 'https://cncmanuals.com/fanuc/435/fanuc-series-0-00-0-mate-operators-manual',
  'B-61410E/03': 'https://cncmanual.com/download/5188/',
  'B-61400E/03': 'https://device.report/m/368c38690b3447eccc56ebd8f50858f3a2ab4001f4c34299808a149fd5e1de14',
  'B-61393E/06': 'https://manualmachine.com/fanuc/b61393e/29140904-connection-manual/',
  'B-61393E-2/02': 'https://pdfcoffee.com/b61393e-2-02-connection-manual-pdf-free.html',
  'B-61395E/07': 'https://www.mroelectric.com/static/app/product/pdfs/fanuc-hmi-manual.pdf',
  'B-54810E/01': 'https://www.scribd.com/document/693782928/Fanuc-10-11-12-Operator-Manual',
  'B-54813E/04': 'https://www.scribd.com/doc/312362012/Fanuc-10-11-12-100-110-120-series-Connecting-Manual-B-54813E-04',
  'B-54815E': 'https://cncmanual.com/download/1439/',
  'B-54044E': 'https://www.scribd.com/document/977233649/B-54044E-02-Fanuc-system-6M-model-B-Operator-s-manual',
  'B-54045E': 'https://store.payloadz.com/details/2648435-documents-and-forms-manuals-fanuc-6m-model-b-maintenance-manual.html',
  'B-62564E/02': 'https://cncmanual.com/fanuc-series-15150-model-b-machining-center-operators-manual-programming-b-62564e02/',
  'B-62564E-1/02': 'https://cncmanual.com/fanuc-series-15150-model-b-machining-center-operators-manual-operation-b-62564e-102/',
  'B-62560E/02': 'https://cncmanual.com/fanuc-series-15150-model-b-parameter-manual-b-62560e02/',
  'B-62075E/04': 'https://cncmanual.com/download/5190/',
  'B-62454E/04': 'https://cncmanual.com/fanuc-series-1616018180-model-b-machining-center-operators-manual-b-62454e04/',
  'B-62444E/03': 'https://cncmanual.com/fanuc-series-1618160180-model-tb-lathe-operator-manual-b-62444e03/',
  'B-62450E/02': 'https://cncmanual.com/fanuc-series-1616018180-model-b-parameter-manual-b-62450e02/',
  'B-62445E/03': 'https://cncmanual.com/fanuc-series-1616018180-model-b-maintenance-manual-b-62445e03/',
  'B-62443E/02': 'https://cncmanual.com/fanuc-series-1616018180-model-b-connection-manual-hardware-b-62443e02/',
  'B-62760EN/01': 'https://cncmanual.com/fanuc-series-1618160180-model-c-parameter-manual-b-62760e01/',
  'B-62755EN/01': 'https://cncmanual.com/fanuc/fanuc-pdf-manuals/fanuc-b-62755/',
  'B-62753EN/01': 'https://cncmanual.com/fanuc-series-1618160180-model-c-connection-manual-hardware-b-62753en01/',
  'B-62754EN/01': 'https://cncmanual.com/fanuc/fanuc-160/',
  'B-62764EN/01': 'https://cncmanual.com/fanuc-series-1618160180-model-c-machining-center-operators-manual-b-62764en01/',
  'B-62753EN-1/01': 'https://cncmanual.com/fanuc/fanuc-160/',
  'B-63005EN/02': 'https://cncmanual.com/fanuc/fanuc-series-manual/',
  'B-63003EN/03': 'https://cncmanual.com/fanuc/fanuc-series-manual/',
  'B-63003EN-1/02': 'https://cncmanual.com/fanuc/fanuc-series-manual/',
  'B-63004EN/02': 'https://cncmanual.com/fanuc/fanuc-series-manual/',
  'B-63014EN/02': 'https://cncmanual.com/fanuc/fanuc-series-manual/',
  'B-63010EN/02': 'https://cncmanual.com/fanuc/fanuc-series-manual/',
  'B-63835EN/03': 'https://cncmanual.com/fanuc-series-0i0i-mate-model-b-maintenance-manual-b-63835en03/',
  'B-64115EN/03': 'https://cncmanual.com/fanuc/fanuc-pdf-manuals/fanuc-b-64115/',
  'B-64305EN/03': 'https://cncmanual.com/fanuc-series-0i0i-mate-model-d-maintenance-manual-b-64305en03/',
  'B-62704EN': 'https://cncmanual.com/fanuc/fanuc-16-18-20-21-manuals/',
  'B-62705EN': 'https://cncmanual.com/fanuc/fanuc-16-18-20-21-manuals/',
  'B-62710EN': 'https://cncmanual.com/fanuc/fanuc-16-18-20-21-manuals/',
  'B-62703EN-1': 'https://cncmanual.com/fanuc/fanuc-16-18-20-21-manuals/',
  'B-62703EN': 'https://cncmanual.com/fanuc/fanuc-16-18-20-21-manuals/',
};

const MITSUBISHI_PDF_URLS: Record<string, string> = {
  'BNP-B2180': 'https://www.mitsubishielectric.com/dl/fa/document/manual/cnc/bnp-b2180(eng)/bnp-b2180(eng)j.pdf',
  'BNP-B2181': 'https://www.mitsubishielectric.com/dl/fa/document/manual/cnc/bnp-b2181(eng)/bnp-b2181(eng)h.pdf',
  'BNP-B2182': 'https://www.mitsubishielectric.com/dl/fa/document/manual/cnc/bnp-b2182(eng)/bnp-b2182(eng)g.pdf',
  'BNP-B2183': 'https://www.mitsubishielectric.com/dl/fa/document/manual/cnc/bnp-b2183(eng)/bnp-b2183(eng)k.pdf',
  'BNP-B2201': 'https://www.mitsubishielectric.com/dl/fa/document/manual/cnc/bnp-b2201(eng)/bnp-b2201(eng)l.pdf',
  'BNP-B2210': 'https://www.mitsubishielectric.com/dl/fa/document/manual/cnc/bnp-b2210(eng)/bnp-b2210(eng)f.pdf',
  'BNP-B2229': 'https://www.mitsubishielectric.com/dl/fa/document/manual/cnc/bnp-b2229(eng)/bnp-b2229(eng)e.pdf',
  'BNP-B2158': 'https://www.mitsubishielectric.com/dl/fa/document/manual/cnc/bnp-b2158(eng)/bnp-b2158(eng)d.pdf',
  'BNP-B2189': 'https://www.mitsubishielectric.com/dl/fa/document/manual/cnc/bnp-b2189(eng)/bnp-b2189(eng)b.pdf',
  'BNP-B2231': 'https://www.mitsubishielectric.com/dl/fa/document/manual/cnc/bnp-b2231(eng)/bnp-b2231(eng)a.pdf',
  'BNP-B2233': 'https://www.mitsubishielectric.com/dl/fa/document/manual/cnc/bnp-b2233(eng)/bnp-b2233(eng)Z.pdf',
  'BNP-B2237': 'https://www.mitsubishielectric.com/dl/fa/document/manual/cnc/bnp-b2237(eng)/bnp-b2237(eng)j.pdf',
  'BNP-B2238': 'https://www.mitsubishielectric.com/dl/fa/document/manual/cnc/bnp-b2238(eng)/bnp-b2238(eng)g.pdf',
  'BNP-B2239': 'https://www.mitsubishielectric.com/dl/fa/document/manual/cnc/bnp-b2239(eng)/bnp-b2239(eng)g.pdf',
  'IB-1500042': 'https://www.mitsubishielectric.com/dl/fa/document/manual/cnc/ib1500042(eng)/ib1500042g.pdf',
  'IB-1500034': 'https://dl.mitsubishielectric.com/dl/fa/document/manual/cnc/ib1500034/ib1500034e.pdf',
  'IB-1500057': 'https://www.mitsubishielectric.com/dl/fa/document/manual/cnc/ib1500057(eng)/ib1500057f.pdf',
  'IB-1500072': 'https://www.mitsubishielectric.com/dl/fa/document/manual/cnc/ib1500072(eng)/ib1500072f.pdf',
};

const fanucDocument = (title: string, kind: DocumentKind, documentNumber: string): CncDocument => ({
  title,
  kind,
  documentNumber,
  language: 'EN',
  url: FANUC_ARCHIVE_URLS[documentNumber] ?? FANUC_PORTAL,
  access: FANUC_ARCHIVE_URLS[documentNumber] ? 'archive' : 'portal',
  officialUrl: FANUC_ARCHIVE_URLS[documentNumber] ? FANUC_PORTAL : undefined,
});

const mitsubishiDocument = (title: string, kind: DocumentKind, documentNumber: string): CncDocument => ({
  title,
  kind,
  documentNumber,
  language: 'EN',
  url: MITSUBISHI_PDF_URLS[documentNumber],
  access: 'direct',
});

export const controllerDocumentGroups: ControllerDocumentGroup[] = [
  {
    id: 'fanuc-0-00-0-mate', brand: 'fanuc', brandLabel: 'FANUC', model: 'Series 0 / 00 / 0-Mate',
    descriptionFa: 'اسناد پایه اپراتوری و نگهداری نسل‌های اولیه سری صفر.',
    descriptionEn: 'Core operation and maintenance references for early Series 0 controls.',
    documents: [
      fanucDocument("Operator's Manual — Machining Center", 'operator', 'B-61404E'),
      fanucDocument('Parameter Manual — Machining Center', 'parameter', 'B-61410E/03'),
      fanucDocument('Parameter Manual — Lathe', 'parameter', 'B-61400E/03'),
      fanucDocument('Connection Manual — Hardware', 'connection', 'B-61393E/06'),
      fanucDocument('Connection Manual — Functions', 'connection', 'B-61393E-2/02'),
      fanucDocument('Maintenance Manual', 'maintenance', 'B-61395E/07'),
    ],
  },
  {
    id: 'fanuc-6m-6t', brand: 'fanuc', brandLabel: 'FANUC', model: 'Series 6M / 6T Model B',
    descriptionFa: 'اسناد اپراتوری و نگهداری کنترلرهای قدیمی و پرکاربرد سری 6 مدل B.',
    descriptionEn: 'Operation and maintenance references for legacy Series 6 Model B controls.',
    documents: [
      fanucDocument("6M Model B Operator's Manual", 'operator', 'B-54044E'),
      fanucDocument('6M Model B Maintenance Manual', 'maintenance', 'B-54045E'),
      { title: '6T Maintenance Manual Archive', kind: 'maintenance', language: 'EN', url: 'https://douglasrudd.org/manuals/', access: 'archive', officialUrl: FANUC_PORTAL },
    ],
  },
  {
    id: 'fanuc-10-11-12', brand: 'fanuc', brandLabel: 'FANUC', model: 'Series 10 / 11 / 12',
    descriptionFa: 'مجموعه اپراتوری، اتصال و نگهداری برای خانواده‌های 10/100، 11/110 و 12/120.',
    descriptionEn: 'Operator, connection, and maintenance set for the 10/100, 11/110, and 12/120 families.',
    documents: [
      fanucDocument("Operator's Manual / Appendixes", 'operator', 'B-54810E/01'),
      fanucDocument('Connection Manual', 'connection', 'B-54813E/04'),
      fanucDocument('Maintenance Manual', 'maintenance', 'B-54815E'),
    ],
  },
  {
    id: 'fanuc-15-150-b', brand: 'fanuc', brandLabel: 'FANUC', model: 'Series 15 / 150 Model B',
    descriptionFa: 'تفکیک دقیق راهبری، برنامه‌نویسی، پارامتر و نگهداری برای Model B.',
    descriptionEn: 'Detailed operation, programming, parameter, and maintenance references for Model B.',
    documents: [
      fanucDocument("Machining Center Operator's Manual — Programming", 'programming', 'B-62564E/02'),
      fanucDocument("Machining Center Operator's Manual — Operation", 'operator', 'B-62564E-1/02'),
      fanucDocument('Parameter Manual', 'parameter', 'B-62560E/02'),
      fanucDocument('Maintenance Manual', 'maintenance', 'B-62075E/04'),
    ],
  },
  {
    id: 'fanuc-16-18-b', brand: 'fanuc', brandLabel: 'FANUC', model: 'Series 16 / 18 Model B',
    descriptionFa: 'مرجع سرویس و عیب‌یابی کنترلرهای Model B.',
    descriptionEn: 'Service and troubleshooting reference for Model B controls.',
    documents: [
      fanucDocument("Operator's Manual — Machining Center", 'operator', 'B-62454E/04'),
      fanucDocument("Operator's Manual — Lathe", 'operator', 'B-62444E/03'),
      fanucDocument('Parameter Manual', 'parameter', 'B-62450E/02'),
      fanucDocument('Maintenance Manual', 'maintenance', 'B-62445E/03'),
      fanucDocument('Connection Manual — Hardware', 'connection', 'B-62443E/02'),
    ],
  },
  {
    id: 'fanuc-16-18-c', brand: 'fanuc', brandLabel: 'FANUC', model: 'Series 16 / 18 Model C',
    descriptionFa: 'مجموعه کامل اپراتوری، پارامتر، اتصال و نگهداری Model C.',
    descriptionEn: 'Complete Model C set: operation, parameters, connection, and maintenance.',
    documents: [
      fanucDocument('Parameter Manual — 16/18/160/180-C', 'parameter', 'B-62760EN/01'),
      fanucDocument('Maintenance Manual', 'maintenance', 'B-62755EN/01'),
      fanucDocument('Connection Manual — Hardware', 'connection', 'B-62753EN/01'),
      fanucDocument("Operator's Manual — Lathe", 'operator', 'B-62754EN/01'),
      fanucDocument("Operator's Manual — Machining Center", 'operator', 'B-62764EN/01'),
      fanucDocument('Connection Manual — Functions', 'connection', 'B-62753EN-1/01'),
    ],
  },
  {
    id: 'fanuc-16i-18i-21i-a', brand: 'fanuc', brandLabel: 'FANUC', model: 'Series 16i / 18i / 21i Model A',
    descriptionFa: 'مجموعه کامل سخت‌افزار، عملکردها، اپراتوری، پارامتر و تعمیرات.',
    descriptionEn: 'Complete hardware, functions, operation, parameter, and maintenance set.',
    documents: [
      fanucDocument('Maintenance Manual', 'maintenance', 'B-63005EN/02'),
      fanucDocument('Connection Manual — Hardware', 'connection', 'B-63003EN/03'),
      fanucDocument('Connection Manual — Functions', 'connection', 'B-63003EN-1/02'),
      fanucDocument("Operator's Manual — Lathe", 'operator', 'B-63004EN/02'),
      fanucDocument("Operator's Manual — Machining Center", 'operator', 'B-63014EN/02'),
      fanucDocument('Parameter Manual', 'parameter', 'B-63010EN/02'),
    ],
  },
  {
    id: 'fanuc-21-210-b', brand: 'fanuc', brandLabel: 'FANUC', model: 'Series 21 / 210 Model B',
    descriptionFa: 'اسناد اپراتوری، اتصال، پارامتر و نگهداری کنترلرهای سری 21 و 210 مدل B.',
    descriptionEn: 'Operation, connection, parameter, and maintenance references for Series 21/210 Model B.',
    documents: [
      fanucDocument("Machining Center Operator's Manual", 'operator', 'B-62704EN'),
      fanucDocument('Maintenance Manual', 'maintenance', 'B-62705EN'),
      fanucDocument('Parameter Manual', 'parameter', 'B-62710EN'),
      fanucDocument('Connection Manual — Functions', 'connection', 'B-62703EN-1'),
      fanucDocument('Connection Manual — Hardware', 'connection', 'B-62703EN'),
    ],
  },
  {
    id: 'fanuc-0i-b', brand: 'fanuc', brandLabel: 'FANUC', model: 'Series 0i-B / 0i Mate-B',
    descriptionFa: 'مرجع نگهداری رسمی خانواده 0i-B.', descriptionEn: 'Official maintenance reference for the 0i-B family.',
    documents: [fanucDocument('Maintenance Manual', 'maintenance', 'B-63835EN/03')],
  },
  {
    id: 'fanuc-0i-c', brand: 'fanuc', brandLabel: 'FANUC', model: 'Series 0i-C / 0i Mate-C',
    descriptionFa: 'مرجع نگهداری رسمی خانواده 0i-C.', descriptionEn: 'Official maintenance reference for the 0i-C family.',
    documents: [fanucDocument('Maintenance Manual', 'maintenance', 'B-64115EN/03')],
  },
  {
    id: 'fanuc-0i-d', brand: 'fanuc', brandLabel: 'FANUC', model: 'Series 0i-D / 0i Mate-D',
    descriptionFa: 'مرجع نگهداری رسمی خانواده 0i-D.', descriptionEn: 'Official maintenance reference for the 0i-D family.',
    documents: [fanucDocument('Maintenance Manual', 'maintenance', 'B-64305EN/03')],
  },
  {
    id: 'heidenhain-tnc-360', brand: 'heidenhain', brandLabel: 'HEIDENHAIN', model: 'TNC 360',
    descriptionFa: 'راهنمای کاربری نسل قدیمی TNC؛ جست‌وجو با شماره سند در Filebase رسمی.',
    descriptionEn: 'Legacy TNC user guide; search the official Filebase by document number.',
    documents: [{ title: "User's Manual", kind: 'operator', documentNumber: '261083-00', language: 'EN', url: HEIDENHAIN_LIBRARY, access: 'library' }],
  },
  {
    id: 'heidenhain-tnc-370', brand: 'heidenhain', brandLabel: 'HEIDENHAIN', model: 'TNC 370',
    descriptionFa: 'دسترسی به آرشیو رسمی اسناد کنترلرهای قدیمی HEIDENHAIN.',
    descriptionEn: 'Official documentation archive access for legacy HEIDENHAIN controls.',
    documents: [{ title: 'Official documentation archive', kind: 'reference', language: 'EN/DE', url: HEIDENHAIN_LIBRARY, access: 'library' }],
  },
  {
    id: 'heidenhain-tnc-407-415', brand: 'heidenhain', brandLabel: 'HEIDENHAIN', model: 'TNC 407 / 415',
    descriptionFa: 'راهنمای کاربری رسمی سری 400 برای نرم‌افزار NC شماره 286 180.',
    descriptionEn: 'Official 400-series user manual for NC software 286 180.',
    documents: [{ title: "User's Manual", kind: 'operator', documentNumber: '291 016-24', language: 'EN', url: 'https://content.heidenhain.de/doku/tnc_guide/pdf_files/TNC400/286180-xx/bhb/291_016-24.pdf', access: 'direct' }],
  },
  {
    id: 'heidenhain-tnc-410', brand: 'heidenhain', brandLabel: 'HEIDENHAIN', model: 'TNC 410',
    descriptionFa: 'راهنمای رسمی برنامه‌نویسی محاوره‌ای و کار با TNC 410.',
    descriptionEn: 'Official conversational programming and operation manual for TNC 410.',
    documents: [{ title: "User's Manual", kind: 'operator', documentNumber: '309 740-25', language: 'EN', url: 'https://content.heidenhain.de/doku/tnc_guide/pdf_files/TNC400/286060-xx/bhb/309_740-25.pdf', access: 'direct' }],
  },
  {
    id: 'heidenhain-tnc-426-430', brand: 'heidenhain', brandLabel: 'HEIDENHAIN', model: 'TNC 426 / 430',
    descriptionFa: 'راهنمای رسمی کنترلرهای TNC 426 و TNC 430.',
    descriptionEn: 'Official user manual for TNC 426 and TNC 430 controls.',
    documents: [{ title: "User's Manual", kind: 'operator', documentNumber: '340 135-22', language: 'EN', url: 'https://content.heidenhain.de/doku/tnc_guide/pdf_files/TNC400/280476-xx/bhb/340_135-22.pdf', access: 'direct' }],
  },
  {
    id: 'heidenhain-itnc-530', brand: 'heidenhain', brandLabel: 'HEIDENHAIN', model: 'iTNC 530',
    descriptionFa: 'راهنمای رسمی کاربری iTNC 530 برای نرم‌افزار NC سری 340 49x.',
    descriptionEn: 'Official iTNC 530 user documentation for NC software 340 49x.',
    documents: [{ title: "User's Manual", kind: 'operator', documentNumber: '533 188-23', revision: 'SW 04', language: 'EN', url: 'https://content.heidenhain.de/doku/tnc_guide/pdf_files/iTNC530/34049x-04/en/533_188-23.pdf', access: 'direct' }],
  },
  {
    id: 'siemens-802d', brand: 'siemens', brandLabel: 'SIEMENS', model: 'SINUMERIK 802D / 802D sl',
    descriptionFa: 'مجموعه راهبری، برنامه‌نویسی، نصب و عیب‌یابی خانواده 802D.',
    descriptionEn: 'Operation, programming, installation, and diagnostics set for the 802D family.',
    documents: [
      { title: 'SINUMERIK User Manual Collection', kind: 'reference', documentNumber: 'TOC UMC 09/2013', language: 'Multi', url: SIEMENS_COLLECTION, access: 'direct' },
      { title: 'Diagnostics Manual — 802D sl', kind: 'diagnostics', documentNumber: '6FC5398-2CP10-4BA0', revision: '11/2012', language: 'EN', url: 'https://support.industry.siemens.com/cs/attachments/80918331/802Dsl_DIA_1112_en.pdf', access: 'direct' },
      { title: 'Operating Instructions — 802D sl', kind: 'operator', documentNumber: '6FC5397-0CP10-8BA0', revision: '11/2012', language: 'EN', url: 'https://support.industry.siemens.com/cs/attachments/80837052/802Dsl_BE_1112_en_en-US.pdf', access: 'direct' },
      { title: 'ISO Dialect Programming and Operating — Turning', kind: 'programming', revision: '09/2001', language: 'EN', url: 'https://support.industry.siemens.com/cs/attachments/67599180/802D_ISD_0901_en.pdf', access: 'direct' },
    ],
  },
  {
    id: 'siemens-810d', brand: 'siemens', brandLabel: 'SIEMENS', model: 'SINUMERIK 810D',
    descriptionFa: 'نمایه جامع اسناد و مرجع مبانی برنامه‌نویسی مشترک 810D/840D.',
    descriptionEn: 'Complete documentation index and shared 810D/840D programming fundamentals.',
    documents: [
      { title: 'Documentation Overview — 840D/840Di/810D', kind: 'reference', language: 'EN', url: 'https://support.industry.siemens.com/cs/attachments/28741046/FBTD_0201_en.pdf', access: 'direct' },
      { title: 'Programming Manual — Fundamentals', kind: 'programming', documentNumber: '6FC5398-1BP10-1BA0', revision: '03/2006', language: 'EN', url: 'https://support.industry.siemens.com/cs/attachments/108682379/PG_0306_en.pdf', access: 'direct' },
      { title: 'Diagnostics Manual — 840D/840Di/810D', kind: 'diagnostics', revision: '10/2004', language: 'EN', url: 'https://support.industry.siemens.com/cs/attachments/107588559/DA_1004_en.pdf', access: 'direct' },
    ],
  },
  {
    id: 'siemens-840d', brand: 'siemens', brandLabel: 'SIEMENS', model: 'SINUMERIK 840D / 840Di',
    descriptionFa: 'نمایه جامع اسناد و مرجع رسمی مبانی برنامه‌نویسی 840D.',
    descriptionEn: 'Complete documentation index and official 840D programming fundamentals.',
    documents: [
      { title: 'Documentation Overview — 840D/840Di/810D', kind: 'reference', language: 'EN', url: 'https://support.industry.siemens.com/cs/attachments/28741046/FBTD_0201_en.pdf', access: 'direct' },
      { title: 'Programming Manual — Fundamentals', kind: 'programming', documentNumber: '6FC5398-1BP10-1BA0', revision: '03/2006', language: 'EN', url: 'https://support.industry.siemens.com/cs/attachments/108682379/PG_0306_en.pdf', access: 'direct' },
      { title: 'Diagnostics Manual — 840D/840Di/810D', kind: 'diagnostics', revision: '10/2004', language: 'EN', url: 'https://support.industry.siemens.com/cs/attachments/107588559/DA_1004_en.pdf', access: 'direct' },
    ],
  },
  {
    id: 'siemens-840c', brand: 'siemens', brandLabel: 'SIEMENS', model: 'SINUMERIK 840C',
    descriptionFa: 'راهنمای اپراتوری و مجموعه اسناد نصب و عیب‌یابی نسل 840C.',
    descriptionEn: 'Operator, installation, and diagnostics references for the legacy 840C generation.',
    documents: [
      { title: "Operator's Guide", kind: 'operator', language: 'EN', url: 'https://www.manualslib.com/manual/1565777/Siemens-Sinumerik-840c.html', access: 'archive' },
      { title: 'Operator / Programming / Installation Collection', kind: 'reference', language: 'EN', url: 'https://manualmachine.com/siemens/840c/4713156-operators-guide/', access: 'archive' },
      { title: 'Complete 840C Manual Collection', kind: 'reference', language: 'Multi', url: 'https://www.manualslib.com/products/Siemens-Sinumerik-840c-2039899.html', access: 'archive' },
    ],
  },
  {
    id: 'mitsubishi-m60', brand: 'mitsubishi', brandLabel: 'MITSUBISHI', model: 'MELDAS M60 / M60S',
    descriptionFa: 'مجموعه اپراتوری، برنامه‌نویسی، اتصال، پارامتر و مشخصات سری M60.',
    descriptionEn: 'Operation, programming, connection, parameter, and specifications set for M60.',
    documents: [
      mitsubishiDocument('Operation Manual', 'operator', 'BNP-B2180'),
      mitsubishiDocument('Programming Manual — Lathe', 'programming', 'BNP-B2181'),
      mitsubishiDocument('Programming Manual — Machining Center', 'programming', 'BNP-B2182'),
      mitsubishiDocument('Connection & Maintenance Manual', 'connection', 'BNP-B2183'),
      mitsubishiDocument('Alarm / Parameter Manual', 'parameter', 'BNP-B2201'),
      mitsubishiDocument('Specifications Manual', 'reference', 'BNP-B2210'),
      mitsubishiDocument('Handbook', 'reference', 'BNP-B2229'),
    ],
  },
  {
    id: 'mitsubishi-m600', brand: 'mitsubishi', brandLabel: 'MITSUBISHI', model: 'MELDAS M600 / M600L / M600M',
    descriptionFa: 'اسناد اتصال، نگهداری، راهبری و پارامتر مدل‌های M600.',
    descriptionEn: 'Connection, maintenance, instruction, and parameter documents for M600 models.',
    documents: [
      mitsubishiDocument('Connection Manual', 'connection', 'BNP-B2158'),
      mitsubishiDocument('Maintenance Manual', 'maintenance', 'BNP-B2189'),
      mitsubishiDocument('M600L Instruction Manual', 'operator', 'BNP-B2231'),
      mitsubishiDocument('M600L Parameter Manual', 'parameter', 'BNP-B2233'),
      mitsubishiDocument('M600M Instruction Manual', 'operator', 'BNP-B2237'),
      mitsubishiDocument('M600M Parameter Manual', 'parameter', 'BNP-B2238'),
      mitsubishiDocument('M600M Programming Manual', 'programming', 'BNP-B2239'),
    ],
  },
  {
    id: 'mitsubishi-m700-m70', brand: 'mitsubishi', brandLabel: 'MITSUBISHI', model: 'MELDAS M700 / M70',
    descriptionFa: 'اسناد اصلی راهبری، اتصال و برنامه‌نویسی سری 700/70.',
    descriptionEn: 'Core instruction, connection, and programming documents for the 700/70 series.',
    documents: [
      mitsubishiDocument('700/70 Series Instruction Manual', 'operator', 'IB-1500042'),
      mitsubishiDocument('700 Series Connection Manual', 'connection', 'IB-1500034'),
      mitsubishiDocument('Programming Manual — Lathe', 'programming', 'IB-1500057'),
      mitsubishiDocument('Programming Manual — Machining Center', 'programming', 'IB-1500072'),
    ],
  },
  {
    id: 'haas-classic-ngc', brand: 'haas', brandLabel: 'HAAS', model: 'Classic Haas Control / NGC',
    descriptionFa: 'کتابخانه رسمی اپراتوری و سرویس برای کنترل کلاسیک و نسل جدید Haas.',
    descriptionEn: 'Official operation and service library for Classic and Next Generation Haas controls.',
    documents: [
      { title: "Operator's & Service Manuals Library", kind: 'reference', language: 'Multi', url: 'https://www.haascnc.com/owners/Service/operators-manual.html', access: 'library' },
      { title: 'Next Generation Control — Electrical Service Manual', kind: 'maintenance', language: 'EN', url: 'https://www.haascnc.com/content/dam/haascnc/en/service/manual/service/next_gen_control_electrical_service_manual.pdf', access: 'direct' },
      { title: 'Classic Haas — Mechanical Service Manual', kind: 'maintenance', revision: '2006', language: 'EN', url: 'https://www.haascnc.com/content/dam/haascnc/en/service/manual/service/english---mechanical-service-manual---2006.pdf', access: 'direct' },
    ],
  },
];
