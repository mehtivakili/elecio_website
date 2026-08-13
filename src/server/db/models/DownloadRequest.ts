import { BaseModel } from './BaseModel';

export type DownloadResource =
  | 'catalog_pdf'
  | 'features_pdf'
  | 'windows_installer'
  | 'android_apk';

export class DownloadRequest extends BaseModel {
  static tableName = 'download_requests';

  name!: string;
  email!: string;
  phone?: string;
  company?: string;
  resource!: DownloadResource;
  locale!: string;
  ipHash?: string;
  userId?: string | null;

  static jsonSchema = {
    type: 'object',
    required: ['name', 'email', 'resource'],
    properties: {
      id: { type: 'integer' },
      name: { type: 'string', minLength: 1, maxLength: 200 },
      email: { type: 'string', format: 'email' },
      phone: { type: 'string', maxLength: 20 },
      company: { type: 'string', maxLength: 200 },
      resource: {
        type: 'string',
        enum: ['catalog_pdf', 'features_pdf', 'windows_installer', 'android_apk'],
      },
      locale: { type: 'string', maxLength: 5 },
    },
  };

  // Actual signed/static download URLs, resolved server-side so they never live in client code —
  // real targets carried over from old/src/app/download/page.tsx, see doc/plan.md §4. The two
  // PDFs are served from our own /public (copied from doc/ 2026-08-07); the installers still
  // point at the existing ElecIO Manager release host — that's a separate product/release cycle
  // (doc/plan.md §0 scope boundary), not something this site should mirror.
  static resourceUrls: Record<DownloadResource, string> = {
    catalog_pdf: '/downloads/elecio-smart-dnc-catalog-2026.pdf',
    features_pdf: '/downloads/elecio-smart-dnc-features.pdf',
    windows_installer:
      'https://storage.webprohost.ir/storage/others/apps/windows/ElecioManager Setup 2.1.0.exe',
    android_apk: 'https://storage.webprohost.ir/storage/others/apps/android/Elecio Manager.apk',
  };

  static resolveResourceUrl(resource: DownloadResource, locale: string): string {
    if (locale === 'en' && resource === 'catalog_pdf') {
      return '/downloads/elecio-smart-dnc-catalog-2026-en.pdf';
    }
    if (locale === 'en' && resource === 'features_pdf') {
      return '/downloads/elecio-smart-dnc-features-en.pdf';
    }
    return this.resourceUrls[resource];
  }
}
