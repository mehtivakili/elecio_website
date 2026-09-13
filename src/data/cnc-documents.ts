export type DocumentKind = 'operator' | 'maintenance' | 'parameter' | 'connection' | 'programming' | 'diagnostics' | 'reference';
export type DocumentAccess = 'direct' | 'library' | 'portal' | 'archive';
export type DocumentSource = 'official' | 'unofficial';
export type DocumentBrand = 'fanuc' | 'heidenhain' | 'siemens' | 'mitsubishi' | 'haas' | 'syntec' | 'gsk' | 'fagor' | 'mazak';

export type CncDocument = {
  title: string;
  kind: DocumentKind;
  documentNumber?: string;
  revision?: string;
  language: string;
  url: string;
  access: DocumentAccess;
  source?: DocumentSource;
  officialUrl?: string;
  coverageFa?: string;
  coverageEn?: string;
};

export type ControllerTechnicalProfile = {
  availabilityPercent: number;
  machineTypesFa: string[];
  machineTypesEn: string[];
  interfaces: string[];
  softwareRange: string;
  tools: string[];
  identificationFa: string;
  identificationEn: string;
  backupFa: string;
  backupEn: string;
  transferFa: string;
  transferEn: string;
  cautionFa: string;
  cautionEn: string;
};

export type ControllerDocumentGroup = {
  id: string;
  brand: DocumentBrand;
  brandLabel: string;
  model: string;
  descriptionFa: string;
  descriptionEn: string;
  technicalProfile?: ControllerTechnicalProfile;
  documents: CncDocument[];
};

const FANUC_PORTAL = 'https://myportal.fanucamerica.com/';
const FANUC_0IC_ARCHIVE = 'https://cncmanual.com/fanuc/fanuc-series-manual/fanuc-series-0i-model-c/';
const FANUC_0ID_ARCHIVE = 'https://www.drivesul.com.br/fanuc-series-0i-model-d';
const FANUC_0IF_ARCHIVE = 'https://www.drivesul.com.br/fanuc-series-0i-model-f';
const HEIDENHAIN_LIBRARY = 'https://www.heidenhain.com/service/downloads/documentation';
const SIEMENS_COLLECTION = 'https://support.industry.siemens.com/cs/attachments/85291197/TOC_UMC_1013.pdf';
const SIEMENS_LIBRARY = 'https://support.industry.siemens.com/cs/products?dtp=Manual&pnid=14590&lc=en-WW';
const MITSUBISHI_LIBRARY = 'https://www.mitsubishielectric.com/fa/products/faspec/download.page?category=ex&kisyu=/cnc&lang=2';
const SYNTEC_LIBRARY = 'https://www.syntecthailand.com/technicalmanual';
const GSK_LIBRARY = 'https://www.gsk.com.cn/zlxz/index.aspx?lcid=31';
const FAGOR_LIBRARY = 'https://www.fagorautomation.com/en/downloads/';
const MAZAK_SUPPORT = 'https://www.mazakusa.com/customer-support/';
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
  source: FANUC_ARCHIVE_URLS[documentNumber] ? 'unofficial' : 'official',
  officialUrl: FANUC_ARCHIVE_URLS[documentNumber] ? FANUC_PORTAL : undefined,
});

const mitsubishiDocument = (title: string, kind: DocumentKind, documentNumber: string): CncDocument => ({
  title,
  kind,
  documentNumber,
  language: 'EN',
  url: MITSUBISHI_PDF_URLS[documentNumber],
  access: 'direct',
  source: 'official',
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
    technicalProfile: {
      availabilityPercent: 90,
      machineTypesFa: ['تراش', 'فرز و ماشین‌سنتر', 'ماشین‌های عمومی'], machineTypesEn: ['Turning', 'Milling / machining centers', 'General-purpose machines'],
      interfaces: ['RS-232C', 'PCMCIA / ATA card', 'Ethernet (option / machine dependent)'], softwareRange: 'Series 0i Model C / 0i Mate Model C', tools: ['FANUC LADDER-III', 'FANUC Program Transfer Tool', 'CompactFlash / ATA utilities'],
      identificationFa: 'پیش از دانلود، مدل دقیق 0i-TC یا 0i-MC و شماره سری/نسخه نرم‌افزار را از صفحه SYSTEM کنترل ثبت کنید.', identificationEn: 'Record the exact 0i-TC or 0i-MC model plus series/software from the SYSTEM screen before choosing a manual.',
      backupFa: 'بکاپ باید شامل SRAM، پارامترها، آفست‌ها، PMC/Ladder و در صورت وجود داده‌های سفارشی سازنده ماشین باشد.', backupEn: 'A complete backup should include SRAM, parameters, offsets, PMC/ladder and any machine-builder data.',
      transferFa: 'انتقال برنامه معمولاً با RS-232 یا کارت ATA انجام می‌شود؛ Baud rate، I/O channel و Handshake باید با دستگاه مقصد یکسان باشد.', transferEn: 'Programs are commonly transferred by RS-232 or ATA card; baud rate, I/O channel and handshake must match.',
      cautionFa: 'پارامترها و PMC ماشین‌ساز هستند؛ بدون بکاپ و تطبیق پسوند مدل روی کنترل دیگری بارگذاری نشوند.', cautionEn: 'Parameters and PMC are machine-builder specific; never restore them to another machine without verification and backup.',
    },
    documents: [
      { title: 'Descriptions Manual', kind: 'reference', documentNumber: 'B-64112EN', language: 'EN', url: FANUC_0IC_ARCHIVE, access: 'archive', source: 'unofficial', officialUrl: FANUC_PORTAL, coverageFa: 'قابلیت‌ها و ساختار کنترل', coverageEn: 'Control functions and architecture' },
      { title: "Operator's Manual — Lathe System", kind: 'operator', documentNumber: 'B-64114EN', language: 'EN', url: 'https://studylib.net/doc/25533843/0i-tc-operators-manual-b-64114en-01-080729', access: 'archive', source: 'unofficial', officialUrl: FANUC_PORTAL, coverageFa: 'کاربری و برنامه‌نویسی تراش', coverageEn: 'Lathe operation and programming' },
      { title: "Operator's Manual — Machining Center System", kind: 'operator', documentNumber: 'B-64124EN', language: 'EN', url: FANUC_0IC_ARCHIVE, access: 'archive', source: 'unofficial', officialUrl: FANUC_PORTAL, coverageFa: 'کاربری و برنامه‌نویسی فرز', coverageEn: 'Mill operation and programming' },
      { title: 'Maintenance Manual', kind: 'maintenance', documentNumber: 'B-64115EN/03', language: 'EN', url: FANUC_ARCHIVE_URLS['B-64115EN/03'], access: 'archive', source: 'unofficial', officialUrl: FANUC_PORTAL, coverageFa: 'عیب‌یابی، تعویض قطعات و بکاپ SRAM', coverageEn: 'Troubleshooting, replacement and SRAM backup' },
      { title: 'Parameter Manual', kind: 'parameter', documentNumber: 'B-64120EN', language: 'EN', url: 'https://manualmachine.com/fanuc/series0imodelc/9143664-parameter-manual/', access: 'archive', source: 'unofficial', officialUrl: FANUC_PORTAL, coverageFa: 'پارامتر CNC و شرح بیت‌ها', coverageEn: 'CNC parameters and bit definitions' },
      { title: 'Connection Manual — Hardware', kind: 'connection', documentNumber: 'B-64113EN', language: 'EN', url: FANUC_0IC_ARCHIVE, access: 'archive', source: 'unofficial', officialUrl: FANUC_PORTAL, coverageFa: 'کانکتورها، کابل‌ها و سیگنال‌ها', coverageEn: 'Connectors, cables and signals' },
      { title: 'Connection Manual — Function', kind: 'connection', documentNumber: 'B-64113EN-1', language: 'EN', url: 'https://www.drivesul.com.br/template/imagens/manuais/manuais-fanuc/fanuc-series-0i-model-c/Series%200i-Model%20C%20-%20Connection%20Manual%20%28Function%29.pdf', access: 'archive', source: 'unofficial', officialUrl: FANUC_PORTAL, coverageFa: 'سیگنال‌های PMC و توابع اتصال', coverageEn: 'PMC signals and interface functions' },
      { title: 'FANUC Customer Portal — verified revisions', kind: 'reference', language: 'EN', url: FANUC_PORTAL, access: 'portal', source: 'official', coverageFa: 'نسخه‌های رسمی پس از ورود', coverageEn: 'Official revisions after sign-in' },
    ],
  },
  {
    id: 'fanuc-0i-d', brand: 'fanuc', brandLabel: 'FANUC', model: 'Series 0i-D / 0i Mate-D',
    descriptionFa: 'مرجع نگهداری رسمی خانواده 0i-D.', descriptionEn: 'Official maintenance reference for the 0i-D family.',
    technicalProfile: {
      availabilityPercent: 92,
      machineTypesFa: ['تراش', 'فرز و ماشین‌سنتر', 'ماشین‌های عمومی'], machineTypesEn: ['Turning', 'Milling / machining centers', 'General-purpose machines'],
      interfaces: ['RS-232C', 'USB memory', 'CompactFlash', 'Ethernet (option)'], softwareRange: 'Series 0i Model D / 0i Mate Model D', tools: ['FANUC LADDER-III', 'FANUC Program Transfer Tool'],
      identificationFa: 'پسوند T یا M، مدل D و نسخه سری/نرم‌افزار صفحه SYSTEM را با جلد منوال تطبیق دهید.', identificationEn: 'Match the T/M suffix, Model D and SYSTEM series/software display to the manual.',
      backupFa: 'SRAM backup، فایل‌های پارامتر/آفست، PMC و برنامه‌های کاربر را جداگانه نگهداری کنید.', backupEn: 'Keep SRAM backup, parameter/offset files, PMC and user programs as separate verified copies.',
      transferFa: 'USB و CF برای فایل آفلاین و RS-232/Ethernet برای انتقال برنامه قابل استفاده‌اند؛ امکانات دقیق به ماشین‌ساز وابسته است.', transferEn: 'USB/CF support offline files and RS-232/Ethernet can transfer programs; exact options depend on the machine builder.',
      cautionFa: 'Startup و پارامترهای محور/اسپیندل باید فقط توسط فرد متخصص و با نسخه پشتیبان معتبر تغییر کنند.', cautionEn: 'Startup and axis/spindle parameters should only be changed by qualified personnel with a verified backup.',
    },
    documents: [
      { title: 'Descriptions Manual', kind: 'reference', documentNumber: 'B-64302EN', language: 'EN', url: FANUC_0ID_ARCHIVE, access: 'archive', source: 'unofficial', officialUrl: FANUC_PORTAL, coverageFa: 'قابلیت‌ها و ساختار کنترل', coverageEn: 'Control functions and architecture' },
      { title: "Operator's Manual — Common", kind: 'operator', documentNumber: 'B-64304EN', language: 'EN', url: 'https://cnchospital.com.tr/wp-content/uploads/2021/12/B-64304EN_03.pdf', access: 'archive', source: 'unofficial', officialUrl: FANUC_PORTAL, coverageFa: 'عملیات مشترک، فایل و انتقال', coverageEn: 'Common operation, files and transfer' },
      { title: "Operator's Manual — Lathe System", kind: 'operator', documentNumber: 'B-64304EN-1', language: 'EN', url: FANUC_0ID_ARCHIVE, access: 'archive', source: 'unofficial', officialUrl: FANUC_PORTAL, coverageFa: 'کاربری و برنامه‌نویسی تراش', coverageEn: 'Lathe operation and programming' },
      { title: "Operator's Manual — Machining Center System", kind: 'operator', documentNumber: 'B-64304EN-2', language: 'EN', url: FANUC_0ID_ARCHIVE, access: 'archive', source: 'unofficial', officialUrl: FANUC_PORTAL, coverageFa: 'کاربری و برنامه‌نویسی فرز', coverageEn: 'Mill operation and programming' },
      { title: 'Maintenance Manual', kind: 'maintenance', documentNumber: 'B-64305EN/03', language: 'EN', url: FANUC_ARCHIVE_URLS['B-64305EN/03'], access: 'archive', source: 'unofficial', officialUrl: FANUC_PORTAL, coverageFa: 'آلارم، نگهداری و بکاپ', coverageEn: 'Alarms, maintenance and backup' },
      { title: 'Parameter Manual', kind: 'parameter', documentNumber: 'B-64310EN', language: 'EN', url: 'https://manuals.plus/m/44fa859de2bdb284cee060847e1da474cabbc5ef44236b5ed4afef821b287c25', access: 'archive', source: 'unofficial', officialUrl: FANUC_PORTAL, coverageFa: 'پارامتر CNC و شرح بیت‌ها', coverageEn: 'CNC parameters and bit definitions' },
      { title: 'Connection Manual — Hardware', kind: 'connection', documentNumber: 'B-64303EN', language: 'EN', url: 'https://www.drivesul.com.br/template/imagens/manuais/manuais-fanuc/fanuc-series-0i-model-d/B-64303EN03%20-%20Series%200i%20_%200i%20Mate%20Model%20D%20-%20Connection%20Manual%28Hardware%29.pdf', access: 'archive', source: 'unofficial', officialUrl: FANUC_PORTAL, coverageFa: 'کانکتورها و سیم‌بندی', coverageEn: 'Connectors and wiring' },
      { title: 'Connection Manual — Function', kind: 'connection', documentNumber: 'B-64303EN-1', language: 'EN', url: 'https://manuals.plus/m/b8ae452be48f0abdf0755979355fcb245443ccbd1d0ae436b41147b7c8f26fbb.pdf', access: 'archive', source: 'unofficial', officialUrl: FANUC_PORTAL, coverageFa: 'PMC، I/O و توابع اتصال', coverageEn: 'PMC, I/O and connection functions' },
      { title: 'FANUC Customer Portal — verified revisions', kind: 'reference', language: 'EN', url: FANUC_PORTAL, access: 'portal', source: 'official', coverageFa: 'نسخه‌های رسمی پس از ورود', coverageEn: 'Official revisions after sign-in' },
    ],
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
    technicalProfile: {
      availabilityPercent: 86,
      machineTypesFa: ['فرز و ماشین‌سنتر', 'قالب‌سازی', 'ماشین‌کاری ۵ محور'], machineTypesEn: ['Milling / machining centers', 'Mold making', '5-axis machining'],
      interfaces: ['Ethernet', 'V.24 / RS-232-C', 'USB (hardware generation dependent)'], softwareRange: 'NC software 340 49x / 340 59x', tools: ['TNCremo', 'iTNC 530 Programming Station'],
      identificationFa: 'شماره کامل NC software را از MOD یا صفحه اطلاعات کنترل بخوانید؛ دو رقم انتهایی نسخه، انتخاب منوال صحیح را تعیین می‌کند.', identificationEn: 'Read the complete NC software number from MOD/control information; its revision determines the correct manual.',
      backupFa: 'با TNCremo از برنامه‌ها، جدول ابزار، Preset، پارامترهای کاربر و فایل‌های PLC قابل دسترس نسخه بگیرید.', backupEn: 'Use TNCremo to back up programs, tool/preset tables, user parameters and accessible PLC files.',
      transferFa: 'Ethernet روش ترجیحی است؛ V.24 برای ماشین‌های قدیمی‌تر استفاده می‌شود و Protocol/Baud باید با کنترل هماهنگ باشد.', transferEn: 'Ethernet is preferred; V.24 is used on older machines and protocol/baud settings must match.',
      cautionFa: 'Machine Parameter و PLC متعلق به ماشین‌ساز است و منوال عمومی HEIDENHAIN جایگزین مدار و مستندات OEM نیست.', cautionEn: 'Machine parameters and PLC are OEM-specific; general HEIDENHAIN manuals do not replace machine-builder documentation.',
    },
    documents: [
      { title: "User's Manual — Conversational Programming", kind: 'operator', documentNumber: '533 188-23', revision: 'SW 04', language: 'EN', url: 'https://content.heidenhain.de/doku/tnc_guide/pdf_files/iTNC530/34049x-04/en/533_188-23.pdf', access: 'direct', source: 'official', coverageFa: 'کاربری، سیکل‌ها و مدیریت برنامه', coverageEn: 'Operation, cycles and program management' },
      { title: "User's Manual — ISO Programming", kind: 'programming', documentNumber: '533 190-23', revision: 'SW 04', language: 'EN', url: 'https://content.heidenhain.de/doku/tnc_guide/pdf_files/iTNC530/34049x-04/en/533_190-23.pdf', access: 'direct', source: 'official', coverageFa: 'برنامه‌نویسی ISO/G-code', coverageEn: 'ISO/G-code programming' },
      { title: 'Official documentation library — all NC revisions', kind: 'reference', language: 'Multi', url: HEIDENHAIN_LIBRARY, access: 'library', source: 'official', coverageFa: 'جست‌وجوی نسخه دقیق، Touch Probe و سیکل‌ها', coverageEn: 'Exact revisions, touch probe and cycle manuals' },
      { title: 'Programming Station and documentation', kind: 'programming', language: 'Multi', url: 'https://www.heidenhain.com/products/cnc-controls-and-digital-readouts/cnc-controls/programming-stations', access: 'library', source: 'official', coverageFa: 'تمرین و تست برنامه خارج از دستگاه', coverageEn: 'Offline programming and testing' },
    ],
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
    technicalProfile: {
      availabilityPercent: 92,
      machineTypesFa: ['تراش', 'فرز و ماشین‌سنتر', 'ماشین‌های چندمحوره'], machineTypesEn: ['Turning', 'Milling / machining centers', 'Multi-axis machines'],
      interfaces: ['Ethernet', 'USB / memory card (panel dependent)', 'RS-232C', 'MELSEC / PLC interfaces'], softwareRange: 'M700 / M70 and M70V variants', tools: ['NC Explorer', 'NC Configurator2', 'MELSOFT PLC tools (OEM/service)'],
      identificationFa: 'مدل M70 یا M700، نوع پنل، نسخه NC و شماره سری Machine Tool Builder را از Maintenance/Diagnosis ثبت کنید.', identificationEn: 'Record M70/M700 model, panel type, NC version and machine-builder series from Maintenance/Diagnosis.',
      backupFa: 'پارامتر NC، PLC، Tool/Work offsets، برنامه‌ها و داده‌های ماشین‌ساز را به صورت بسته‌های جداگانه و تاریخ‌دار ذخیره کنید.', backupEn: 'Store dated, separate backups of NC parameters, PLC, tool/work offsets, programs and builder data.',
      transferFa: 'NC Explorer/Ethernet برای مدیریت فایل شبکه مناسب است؛ RS-232 و حافظه جانبی به پیکربندی پنل و ماشین بستگی دارند.', transferEn: 'NC Explorer/Ethernet supports network file management; RS-232 and removable media depend on panel/machine configuration.',
      cautionFa: 'M700 و M70 اسناد مشترک زیادی دارند، اما اتصال، پنل و PLC می‌تواند متفاوت باشد؛ شماره IB و Variant را تطبیق دهید.', cautionEn: 'M700 and M70 share many manuals, but panel, connection and PLC details may differ; match IB number and variant.',
    },
    documents: [
      { ...mitsubishiDocument('700/70 Series Instruction Manual', 'operator', 'IB-1500042'), coverageFa: 'کاربری، فایل، تنظیم و عملیات پایه', coverageEn: 'Operation, files, setup and basic procedures' },
      { ...mitsubishiDocument('700 Series Connection Manual', 'connection', 'IB-1500034'), coverageFa: 'سخت‌افزار، کانکتور و سیم‌بندی', coverageEn: 'Hardware, connectors and wiring' },
      { ...mitsubishiDocument('Programming Manual — Lathe', 'programming', 'IB-1500057'), coverageFa: 'G-code و سیکل‌های تراش', coverageEn: 'Lathe G-code and cycles' },
      { ...mitsubishiDocument('Programming Manual — Machining Center', 'programming', 'IB-1500072'), coverageFa: 'G-code و سیکل‌های فرز', coverageEn: 'Mill G-code and cycles' },
      { title: 'M700/M70 Series Specifications Manual', kind: 'reference', documentNumber: 'IB-1500946', language: 'EN', url: 'https://dl.mitsubishielectric.com/dl/fa/document/manual/cnc/ib1500946/ib1500946enga.pdf', access: 'direct', source: 'official', coverageFa: 'مدل‌ها، Optionها و مشخصات سیستم', coverageEn: 'Models, options and system specifications' },
      { title: '70 Series Connection Manual', kind: 'connection', documentNumber: 'IB-1500254', language: 'EN', url: MITSUBISHI_LIBRARY, access: 'library', source: 'official', coverageFa: 'اتصال سخت‌افزار سری 70', coverageEn: '70-series hardware connection' },
      { title: 'Alarm / Parameter Manual', kind: 'parameter', language: 'Multi', url: MITSUBISHI_LIBRARY, access: 'library', source: 'official', coverageFa: 'پارامترها، آلارم NC/Drive و روش بررسی', coverageEn: 'Parameters, NC/drive alarms and checks' },
      { title: 'Official CNC manual search', kind: 'reference', language: 'Multi', url: MITSUBISHI_LIBRARY, access: 'library', source: 'official', coverageFa: 'Revisionهای جدید و اسناد PLC/Drive', coverageEn: 'Current revisions and PLC/drive manuals' },
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
  {
    id: 'fanuc-0i-f-plus', brand: 'fanuc', brandLabel: 'FANUC', model: 'Series 0i-F / 0i-F Plus',
    descriptionFa: 'نسل جدید و بسیار پرکاربرد سری 0i برای تراش، فرز و ماشین‌های عمومی.',
    descriptionEn: 'Current, widely used 0i generation for turning, milling and general-purpose machines.',
    technicalProfile: {
      availabilityPercent: 88,
      machineTypesFa: ['تراش', 'فرز و ماشین‌سنتر', 'ماشین‌های عمومی و ربات‌لودر'], machineTypesEn: ['Turning', 'Milling / machining centers', 'General machines and robot loading'],
      interfaces: ['USB memory', 'Ethernet', 'Fast Ethernet / embedded Ethernet', 'RS-232C (configuration dependent)'], softwareRange: 'Series 0i Model F / 0i-F Plus', tools: ['FANUC LADDER-III', 'FANUC Program Transfer Tool', 'FANUC CNC Guide'],
      identificationFa: 'عبارت Model F یا F Plus، نوع T/M و شناسه سری نرم‌افزار را از SYSTEM ثبت کنید؛ منوال‌های F و F Plus همیشه قابل جایگزینی نیستند.', identificationEn: 'Record Model F versus F Plus, T/M type and software series; F and F Plus manuals are not always interchangeable.',
      backupFa: 'از All Data Backup در کنار خروجی جداگانه پارامتر، آفست، PMC و برنامه‌ها استفاده و فایل بازیابی را آزمایش کنید.', backupEn: 'Use All Data Backup plus separate parameter, offset, PMC and program exports, then verify the restore media.',
      transferFa: 'Ethernet و USB روش‌های اصلی‌اند؛ RS-232 فقط در پیکربندی‌هایی که سخت‌افزار یا Option آن نصب شده قابل استفاده است.', transferEn: 'Ethernet and USB are primary; RS-232 is available only on configurations fitted with the required hardware/options.',
      cautionFa: 'امکانات شبکه، Data Server و رمزگذاری به Option و تنظیم ماشین‌ساز وابسته‌اند.', cautionEn: 'Networking, Data Server and encryption features depend on installed options and the machine builder.',
    },
    documents: [
      { title: '0i-F / 0i-F Plus — Official customer portal', kind: 'reference', language: 'EN', url: FANUC_PORTAL, access: 'portal', source: 'official', coverageFa: 'آخرین Revision و نرم‌افزارهای مجاز', coverageEn: 'Latest authorized revisions and software' },
      { title: 'Descriptions Manual', kind: 'reference', documentNumber: 'B-64602EN', language: 'EN', url: FANUC_0IF_ARCHIVE, access: 'archive', source: 'unofficial', officialUrl: FANUC_PORTAL, coverageFa: 'قابلیت‌ها و ساختار کنترل', coverageEn: 'Control functions and architecture' },
      { title: "Operator's Manual — Common / Lathe / Machining Center", kind: 'operator', documentNumber: 'B-64604EN series', language: 'EN', url: FANUC_0IF_ARCHIVE, access: 'archive', source: 'unofficial', officialUrl: FANUC_PORTAL, coverageFa: 'کاربری، برنامه‌نویسی و مدیریت فایل', coverageEn: 'Operation, programming and file handling' },
      { title: 'Maintenance Manual', kind: 'maintenance', documentNumber: 'B-64605EN', language: 'EN', url: FANUC_0IF_ARCHIVE, access: 'archive', source: 'unofficial', officialUrl: FANUC_PORTAL, coverageFa: 'عیب‌یابی، آلارم و بازیابی', coverageEn: 'Troubleshooting, alarms and recovery' },
      { title: 'Parameter Manual', kind: 'parameter', documentNumber: 'B-64610EN', language: 'EN', url: 'https://www.drivesul.com.br/template/imagens/manuais/manuais-fanuc/fanuc-series-0i-model-f/FANUC%20Series%200i%20MODEL%20F%20-%20PARAMETER%20MANUAL%20.pdf', access: 'archive', source: 'unofficial', officialUrl: FANUC_PORTAL, coverageFa: 'پارامترها و Bit definition', coverageEn: 'Parameters and bit definitions' },
      { title: 'Connection Manual — Hardware / Function', kind: 'connection', documentNumber: 'B-64603EN series', language: 'EN', url: FANUC_0IF_ARCHIVE, access: 'archive', source: 'unofficial', officialUrl: FANUC_PORTAL, coverageFa: 'کانکتور، کابل، شبکه، PMC و I/O', coverageEn: 'Connectors, network, PMC and I/O' },
      { title: '0i-F Plus / 30i-B Plus — Seamless CNC Overview', kind: 'reference', language: 'EN', url: 'https://www.fanuc.eu/~/media/files/pdf/products/cnc/brochures/mbr-02265-fa%20seamless%20cnc%20concept-v5/brochure-seamless-cnc-en.pdf?la=en', access: 'direct', source: 'official', coverageFa: 'نمای کلی امکانات نسل Plus', coverageEn: 'Plus-generation feature overview' },
    ],
  },
  {
    id: 'fanuc-30i-31i-32i-b', brand: 'fanuc', brandLabel: 'FANUC', model: 'Series 30i / 31i / 32i Model B & B Plus',
    descriptionFa: 'خانواده رده‌بالای FANUC برای ماشین‌های چندمحوره، چندکاناله و کاربردهای پیچیده.',
    descriptionEn: 'High-end FANUC family for multi-axis, multi-path and complex machine applications.',
    documents: [
      { title: '30i/31i/32i-B Plus — Official documentation portal', kind: 'reference', language: 'EN', url: FANUC_PORTAL, access: 'portal' },
      { title: '0i-F Plus / 30i-B Plus — Seamless CNC Overview', kind: 'reference', language: 'EN', url: 'https://www.fanuc.eu/~/media/files/pdf/products/cnc/brochures/mbr-02265-fa%20seamless%20cnc%20concept-v5/brochure-seamless-cnc-en.pdf?la=en', access: 'direct' },
    ],
  },
  {
    id: 'siemens-808d', brand: 'siemens', brandLabel: 'SIEMENS', model: 'SINUMERIK 808D / 808D Advanced',
    descriptionFa: 'کنترلر اقتصادی زیمنس برای تراش و فرزهای استاندارد و ماشین‌های آسیایی.',
    descriptionEn: 'Entry-level SINUMERIK control for standard turning and milling machines.',
    documents: [
      { title: '808D / 808D Advanced — Official manuals library', kind: 'reference', language: 'Multi', url: SIEMENS_LIBRARY, access: 'library' },
      { title: 'Access MyMachine /P2P — 808D, 828D and 840D sl', kind: 'connection', documentNumber: '6FC5398-1EP40-0BA0', revision: '12/2017', language: 'EN', url: 'https://support.industry.siemens.com/cs/attachments/109752342/840Dsl_828D_808D_AMM_op_man_1217_en-US.pdf', access: 'direct' },
    ],
  },
  {
    id: 'siemens-828d', brand: 'siemens', brandLabel: 'SIEMENS', model: 'SINUMERIK 828D',
    descriptionFa: 'کنترلر جمع‌وجور و قدرتمند برای ماشین‌های استاندارد تراش و فرز با SINUMERIK Operate.',
    descriptionEn: 'Compact control for standard milling and turning machines with SINUMERIK Operate.',
    technicalProfile: {
      availabilityPercent: 95,
      machineTypesFa: ['تراش', 'فرز', 'سنگ‌زنی در پیکربندی‌های پشتیبانی‌شده'], machineTypesEn: ['Turning', 'Milling', 'Grinding on supported configurations'],
      interfaces: ['Ethernet', 'USB', 'PROFINET / PLC I/O', 'RS-232 via supported hardware'], softwareRange: 'SINUMERIK 828D, Operate V4.x', tools: ['Access MyMachine /P2P', 'Create MyConfig', 'SINUMERIK Operate'],
      identificationFa: 'نسخه Operate، MLFB/Order Number پنل و نسخه CNC/PLC/Drive را از Diagnostics ثبت کنید.', identificationEn: 'Record Operate version, panel MLFB/order number and CNC/PLC/drive versions from Diagnostics.',
      backupFa: 'Archive کامل commissioning را همراه با NC، PLC، Drive، HMI و داده‌های OEM بگیرید و یک نسخه خارج از ماشین نگهدارید.', backupEn: 'Create a full commissioning archive containing NC, PLC, drive, HMI and OEM data, and keep an off-machine copy.',
      transferFa: 'USB و شبکه از داخل Program Manager قابل استفاده‌اند؛ Access MyMachine /P2P برای اتصال سرویس و تبادل فایل کاربرد دارد.', transferEn: 'USB/network are available in Program Manager; Access MyMachine /P2P supports service connection and file exchange.',
      cautionFa: 'پیش از Restore، نسخه نرم‌افزار و سخت‌افزار مقصد را با Archive تطبیق دهید؛ آرشیو اشتباه می‌تواند PLC/Drive را نیز تغییر دهد.', cautionEn: 'Match target software/hardware before restore; an incorrect archive can also overwrite PLC and drive data.',
    },
    documents: [
      { title: '828D Documentation Overview', kind: 'reference', documentNumber: 'DOConCD V4.7 SP2', language: 'EN', url: 'https://support.industry.siemens.com/cs/attachments/109482371/TOC_DOConCD_SINUMERIK_V4.7SP2.pdf', access: 'direct', source: 'official', coverageFa: 'شماره سند همه منوال‌های این نسل', coverageEn: 'Document numbers for the complete manual set' },
      { title: 'Operating Manual — Universal / Turning / Milling', kind: 'operator', documentNumber: '6FC5398 series', language: 'Multi', url: SIEMENS_LIBRARY, access: 'library', source: 'official', coverageFa: 'کاربری SINUMERIK Operate برای تراش و فرز', coverageEn: 'SINUMERIK Operate for turning and milling' },
      { title: 'Programming Manual — Fundamentals and Job Planning', kind: 'programming', documentNumber: '6FC5398-1BP40 / 2BP40', language: 'Multi', url: SIEMENS_LIBRARY, access: 'library', source: 'official', coverageFa: 'G-code، سیکل‌ها و برنامه‌ریزی کار', coverageEn: 'G-code, cycles and job planning' },
      { title: 'CNC Commissioning Manual', kind: 'maintenance', documentNumber: '828D CNC commissioning', revision: '01/2023', language: 'EN', url: 'https://support.industry.siemens.com/cs/attachments/109820804/828D_CNC_commiss_man_0123_en-US.pdf', access: 'direct', source: 'official', coverageFa: 'راه‌اندازی، Archive، Restore و تنظیمات', coverageEn: 'Commissioning, archive, restore and configuration' },
      { title: 'Service Manual', kind: 'maintenance', documentNumber: '6FC5397-5DP40-6BA2', revision: '07/2021', language: 'EN', url: 'https://support.industry.siemens.com/cs/attachments/109804584/828D_service_man_en-US.pdf', access: 'direct', source: 'official', coverageFa: 'سرویس، تعویض قطعه و بازیابی', coverageEn: 'Service, component replacement and recovery' },
      { title: 'Machine Data and Parameter Manuals', kind: 'parameter', documentNumber: '6FC5397-4DP40 series', language: 'Multi', url: SIEMENS_LIBRARY, access: 'library', source: 'official', coverageFa: 'Machine Data، NC variables و Drive parameters', coverageEn: 'Machine data, NC variables and drive parameters' },
      { title: 'Diagnostics Manual', kind: 'diagnostics', documentNumber: '6FC5398-8BP40 series', language: 'Multi', url: SIEMENS_LIBRARY, access: 'library', source: 'official', coverageFa: 'آلارم‌های NC، PLC و Drive', coverageEn: 'NC, PLC and drive alarms' },
      { title: 'Access MyMachine /P2P', kind: 'connection', documentNumber: '6FC5398-1EP40-0BA0', revision: '12/2017', language: 'EN', url: 'https://support.industry.siemens.com/cs/attachments/109752342/840Dsl_828D_808D_AMM_op_man_1217_en-US.pdf', access: 'direct', source: 'official', coverageFa: 'اتصال سرویس و انتقال فایل', coverageEn: 'Service connectivity and file transfer' },
      { title: 'ManualsLib mirror — fallback archive', kind: 'reference', language: 'EN', url: 'https://www.manualslib.com/products/Siemens-Sinumerik-828d-Turning-5117985.html', access: 'archive', source: 'unofficial', officialUrl: SIEMENS_LIBRARY, coverageFa: 'نسخه جایگزین در صورت اختلال منبع رسمی', coverageEn: 'Fallback mirror if the official library is unavailable' },
    ],
  },
  {
    id: 'siemens-840d-sl', brand: 'siemens', brandLabel: 'SIEMENS', model: 'SINUMERIK 840D sl',
    descriptionFa: 'نسل ماژولار 840D برای ماشین‌های پیشرفته، چندمحوره و خطوط تولید.',
    descriptionEn: 'Modular 840D generation for advanced multi-axis machines and production systems.',
    documents: [
      { title: '840D sl — Official manuals library', kind: 'reference', language: 'Multi', url: SIEMENS_LIBRARY, access: 'library' },
      { title: 'SINUMERIK Operate — Turning', kind: 'operator', language: 'EN', url: 'https://static.dc.siemens.com/cnc4you/CNC-Downloads/828D_840Dsl_Operate_Turning_offer_ov_0821_en-US/828D_840Dsl_Operate_Turning_offer_ov_0821_en-US/start.html', access: 'library' },
      { title: 'Access MyMachine /P2P', kind: 'connection', documentNumber: '6FC5398-1EP40-0BA0', revision: '12/2017', language: 'EN', url: 'https://support.industry.siemens.com/cs/attachments/109752342/840Dsl_828D_808D_AMM_op_man_1217_en-US.pdf', access: 'direct' },
    ],
  },
  {
    id: 'heidenhain-tnc-320', brand: 'heidenhain', brandLabel: 'HEIDENHAIN', model: 'TNC 320',
    descriptionFa: 'کنترل کامپکت برای فرز، سوراخ‌کاری، ماشین‌کاری ۳+۲ محور و رتروفیت.',
    descriptionEn: 'Compact control for milling, drilling, 3+2 machining and retrofits.',
    documents: [
      { title: 'TNC 320 — Official user documentation', kind: 'reference', language: 'Multi', url: HEIDENHAIN_LIBRARY, access: 'library' },
      { title: 'TNC 320 — Product and documentation overview', kind: 'reference', documentNumber: '1113513', language: 'EN', url: 'https://www.heidenhain.com/fileadmin/pdf/en/01_Products/Prospekte/PR_TNC320_OEM_ID1113513_en.pdf', access: 'direct' },
    ],
  },
  {
    id: 'heidenhain-tnc-620', brand: 'heidenhain', brandLabel: 'HEIDENHAIN', model: 'TNC 620',
    descriptionFa: 'کنترل قدرتمند فرز و ماشین‌کاری تا پنج محور با رابط چندلمسی.',
    descriptionEn: 'Powerful milling and machining control for up to five axes with multi-touch operation.',
    documents: [
      { title: 'TNC 620 — Official user documentation', kind: 'reference', language: 'Multi', url: HEIDENHAIN_LIBRARY, access: 'library' },
      { title: 'TNC programming station — Free demo and documentation', kind: 'programming', language: 'Multi', url: 'https://www.heidenhain.com/products/cnc-controls-and-digital-readouts/cnc-controls/programming-stations', access: 'library' },
    ],
  },
  {
    id: 'heidenhain-tnc-640', brand: 'heidenhain', brandLabel: 'HEIDENHAIN', model: 'TNC 640',
    descriptionFa: 'کنترل رده‌بالای فرز، فرز-تراش، سنگ‌زنی، HSC و ماشین‌کاری هم‌زمان پنج محور.',
    descriptionEn: 'High-end control for milling, mill-turn, grinding, HSC and simultaneous five-axis machining.',
    technicalProfile: {
      availabilityPercent: 92,
      machineTypesFa: ['فرز و ماشین‌سنتر', 'فرز-تراش', '۵ محور هم‌زمان', 'سنگ‌زنی و HSC'], machineTypesEn: ['Milling / machining centers', 'Mill-turn', 'Simultaneous 5-axis', 'Grinding and HSC'],
      interfaces: ['Ethernet', 'USB', 'V.24 / RS-232-C', 'PROFINET / HSCI (OEM)'], softwareRange: 'NC software 34059x; manual revision must match', tools: ['TNCremo', 'TNC 640 Programming Station'],
      identificationFa: 'شماره کامل NC software مانند 34059x-xx و نسل سخت‌افزار را از MOD/اطلاعات کنترل ثبت کنید.', identificationEn: 'Record the complete NC software identifier (for example 34059x-xx) and hardware generation.',
      backupFa: 'Service backup را با TNCremo و طبق Setup Manual بگیرید؛ برنامه، Tool/Preset table و داده OEM را نیز جدا نگه دارید.', backupEn: 'Create a service backup with TNCremo per the Setup Manual and separately retain programs, tool/preset tables and OEM data.',
      transferFa: 'Ethernet/USB روش اصلی است؛ V.24 با کابل و تنظیم Protocol صحیح برای تجهیزات قدیمی‌تر پشتیبانی می‌شود.', transferEn: 'Ethernet/USB are primary; V.24 supports older equipment when cable and protocol settings match.',
      cautionFa: 'منوال‌ها به نسخه NC وابسته‌اند. استفاده از منوال Revision دیگر برای Machine Parameter یا Restore ریسک بالایی دارد.', cautionEn: 'Manuals are NC-version specific. Using another revision for machine parameters or restore is high risk.',
    },
    documents: [
      { title: 'TNC 640 — Official documentation by NC version', kind: 'reference', language: 'Multi', url: 'https://content.heidenhain.de/doku/tnc_guide/html/en/index/1242135142456/1242135142489/1646880172657/1646880172657.html', access: 'library', source: 'official', coverageFa: 'انتخاب منوال بر اساس نسخه دقیق NC', coverageEn: 'Manual selection by exact NC version' },
      { title: 'Setup, Testing and Running NC Programs', kind: 'maintenance', documentNumber: '1261174-25', revision: 'SW 34059x-18', language: 'EN', url: 'https://content.heidenhain.de/doku/tnc_guide/pdf_files/TNC640/34059x-18/einrichten/1261174-25.pdf', access: 'direct', source: 'official', coverageFa: 'Setup، بکاپ، Ethernet و V.24/RS-232', coverageEn: 'Setup, backup, Ethernet and V.24/RS-232' },
      { title: 'Conversational Programming Manual', kind: 'programming', documentNumber: '892903 series', revision: 'Match NC software', language: 'Multi', url: HEIDENHAIN_LIBRARY, access: 'library', source: 'official', coverageFa: 'برنامه‌نویسی Klartext و توابع مسیر', coverageEn: 'Klartext programming and path functions' },
      { title: 'ISO Programming Manual', kind: 'programming', documentNumber: '892909 series', revision: 'Match NC software', language: 'Multi', url: HEIDENHAIN_LIBRARY, access: 'library', source: 'official', coverageFa: 'برنامه‌نویسی DIN/ISO', coverageEn: 'DIN/ISO programming' },
      { title: 'Machining Cycles Manual', kind: 'operator', documentNumber: '1303406 series', revision: 'Match NC software', language: 'Multi', url: HEIDENHAIN_LIBRARY, access: 'library', source: 'official', coverageFa: 'سیکل‌های سوراخ‌کاری، فرز و تبدیل مختصات', coverageEn: 'Drilling, milling and coordinate transformation cycles' },
      { title: 'Measuring Cycles Manual', kind: 'operator', documentNumber: '1303409 series', revision: 'Match NC software', language: 'Multi', url: HEIDENHAIN_LIBRARY, access: 'library', source: 'official', coverageFa: 'Touch Probe، اندازه‌گیری قطعه و ابزار', coverageEn: 'Touch probe, workpiece and tool measurement' },
      { title: 'TNC 640 — Product resources', kind: 'reference', language: 'Multi', url: 'https://www.heidenhain.com/products/cnc-controls-and-digital-readouts/cnc-controls/tnc-640', access: 'library', source: 'official', coverageFa: 'مشخصات و منابع محصول', coverageEn: 'Product specifications and resources' },
    ],
  },
  {
    id: 'mitsubishi-m80-m800-e80', brand: 'mitsubishi', brandLabel: 'MITSUBISHI', model: 'M800 / M80 / E80 Series',
    descriptionFa: 'نسل جدید Mitsubishi CNC برای فرز، تراش، چندمحوره و ماشین‌های استاندارد.',
    descriptionEn: 'Current Mitsubishi CNC generation for milling, turning, multi-axis and standard machines.',
    documents: [
      { title: 'M800/M80/E80 Series Instruction Manual', kind: 'operator', documentNumber: 'IB-1501274', language: 'EN', url: 'https://dl.mitsubishielectric.com/dl/fa/document/manual/cnc/ib1501274/ib1501274engn.pdf', access: 'direct' },
      { title: 'M800/M80/E80/C80 — Official manual library', kind: 'reference', language: 'Multi', url: MITSUBISHI_LIBRARY, access: 'library' },
      { title: 'M800/M80/E80/C80 Series Handbook', kind: 'reference', documentNumber: 'IB-1501280', language: 'EN', url: 'https://dl.mitsubishielectric.com/dl/fa/document/manual/cnc/ib1501280/ib1501280engb.pdf', access: 'direct' },
    ],
  },
  {
    id: 'syntec-6-series', brand: 'syntec', brandLabel: 'SYNTEC', model: 'Syntec 6 Series — 6MB / 6MA / 6TA',
    descriptionFa: 'خانواده پرکاربرد Syntec برای فرز، تراش، روتر، چوب و سنگ.',
    descriptionEn: 'Popular Syntec family for milling, turning, routing, woodworking and stone machines.',
    documents: [
      { title: '6 Series Mill Operation Manual', kind: 'operator', language: 'EN', url: SYNTEC_LIBRARY, access: 'library' },
      { title: '6 Series Lathe Operation Manual', kind: 'operator', language: 'EN', url: SYNTEC_LIBRARY, access: 'library' },
      { title: 'CNC Parameter and Alarm Manuals', kind: 'parameter', language: 'EN', url: SYNTEC_LIBRARY, access: 'library' },
    ],
  },
  {
    id: 'syntec-21-22-series', brand: 'syntec', brandLabel: 'SYNTEC', model: 'Syntec 21 / 22 Series',
    descriptionFa: 'کنترلرهای نسل بالاتر Syntec برای فرز، تراش و کاربردهای چندمحوره.',
    descriptionEn: 'Higher-generation Syntec controls for milling, turning and multi-axis applications.',
    documents: [
      { title: '21 Series Mill Operation Manual', kind: 'operator', language: 'EN', url: SYNTEC_LIBRARY, access: 'library' },
      { title: '21 Series Lathe Operation Manual', kind: 'operator', language: 'EN', url: SYNTEC_LIBRARY, access: 'library' },
      { title: 'G-code Milling and Turning Programming Manuals', kind: 'programming', language: 'EN', url: SYNTEC_LIBRARY, access: 'library' },
    ],
  },
  {
    id: 'gsk-928-series', brand: 'gsk', brandLabel: 'GSK', model: 'GSK 928 Series',
    descriptionFa: 'کنترل اقتصادی و رایج برای تراش‌های دو محور و پروژه‌های رتروفیت.',
    descriptionEn: 'Cost-effective control for two-axis lathes and retrofit projects.',
    documents: [
      { title: 'GSK928TD Turning CNC System User Manual', kind: 'operator', language: 'EN', url: 'https://www.gsk.com.cn/uploadfiles/%E7%BD%91%E7%AB%99%E8%AF%B4%E6%98%8E%E4%B9%A6/cnc/%E7%A0%94%E5%8F%91%E4%B8%80%E5%AE%A4/928%E8%BD%A6%E5%BA%8A%E7%B3%BB%E5%88%97/03%20%20gsk%20928td%20%E8%BD%A6%E5%BA%8A%E6%95%B0%E6%8E%A7%E7%B3%BB%E7%BB%9F/02%20%20%E8%8B%B1%E6%96%87%E7%89%88/%E8%8B%B1%E6%96%87%E7%89%88%20gsk928td%20%E8%BD%A6%E5%BA%8A%E6%95%B0%E6%8E%A7%E7%B3%BB%E7%BB%9F%20%E4%BD%BF%E7%94%A8%E6%89%8B%E5%86%8C%EF%BC%882012%E5%B9%B42%E6%9C%88%E7%AC%AC1%E7%89%88%EF%BC%89-2012-07-25%E5%AE%9A%E7%A8%BF/%E8%8B%B1%E6%96%87%E7%89%88%20GSK928TD%20%E8%BD%A6%E5%BA%8A%E6%95%B0%E6%8E%A7%E7%B3%BB%E7%BB%9F%20%E4%BD%BF%E7%94%A8%E6%89%8B%E5%86%8C%EF%BC%882012%E5%B9%B42%E6%9C%88%E7%AC%AC1%E7%89%88%EF%BC%89-2012-07-25%E5%AE%9A%E7%A8%BF.pdf', access: 'direct' },
      { title: 'GSK 928 Series — Official downloads', kind: 'reference', language: 'ZH/EN', url: 'https://www.gsk.com.cn/zlxz/index_15.aspx?lcid=31', access: 'library' },
    ],
  },
  {
    id: 'gsk-980-series', brand: 'gsk', brandLabel: 'GSK', model: 'GSK 980 Series — TDc / TDi / MDc / MDi',
    descriptionFa: 'خانواده متداول GSK برای تراش، فرز و ماشین‌های اقتصادی چینی.',
    descriptionEn: 'Common GSK family for lathes, mills and cost-effective Chinese machines.',
    documents: [
      { title: 'GSK 980 Series — Official CNC downloads', kind: 'reference', language: 'ZH/EN', url: GSK_LIBRARY, access: 'library' },
      { title: '980 Series Programming, Operation and PLC Manuals', kind: 'programming', language: 'EN', url: 'https://www.gskcnc.com.tr/En/Downloads.aspx?d-kat-id=13&kat-ad=gsk-980-tdb', access: 'library', officialUrl: GSK_LIBRARY },
    ],
  },
  {
    id: 'fagor-8055', brand: 'fagor', brandLabel: 'FAGOR', model: 'Fagor CNC 8055',
    descriptionFa: 'کنترلر مناسب فرز، تراش، رتروفیت و ماشین‌های اروپایی با اسناد فنی کامل.',
    descriptionEn: 'Control for milling, turning, retrofits and European machines with extensive documentation.',
    documents: [
      { title: 'CNC 8055 — Official documentation collection', kind: 'reference', language: 'Multi', url: 'https://fagorautomation.com/it/other_cnc_products/8055-it/', access: 'library' },
      { title: 'CNC 8055 M Programming and Operating Manuals', kind: 'programming', language: 'EN', url: FAGOR_LIBRARY, access: 'library' },
      { title: 'CNC 8055 Error Troubleshooting', kind: 'diagnostics', language: 'EN', url: FAGOR_LIBRARY, access: 'library' },
    ],
  },
  {
    id: 'mazak-fusion-matrix', brand: 'mazak', brandLabel: 'MAZATROL', model: 'MAZATROL Fusion 640 / Matrix / Matrix 2',
    descriptionFa: 'کنترل‌های مکالمه‌ای Mazak روی نسل بزرگی از تراش‌ها، فرزها و ماشین‌های چندکاره.',
    descriptionEn: 'Mazak conversational controls used across turning, milling and multitasking machines.',
    documents: [
      { title: 'Fusion 640 / Matrix — Official customer support', kind: 'reference', language: 'EN', url: MAZAK_SUPPORT, access: 'portal' },
      { title: 'MAZATROL programming and control resources', kind: 'programming', language: 'EN', url: 'https://www.mazakusa.com/technology/mazatrol/', access: 'library' },
    ],
  },
];

export function getControllerGroupsByBrand(brand: string) {
  return controllerDocumentGroups.filter((group) => group.brand === brand);
}

export function getControllerDocumentGroup(brand: string, model: string) {
  return controllerDocumentGroups.find((group) => group.brand === brand && group.id === model);
}
