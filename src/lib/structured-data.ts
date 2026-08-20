// JSON-LD builders shared across pages. Every field here must come from data already shown to
// the visitor elsewhere on the page — never invent prices, ratings, reviews, or availability
// (see doc/plan.md A5 §10.4 and deliverables/Elecio_SEO_Execution_Plan_FA.pdf §3.2/§9).
import { SITE_URL, SITE_NAME } from './seo';
import { CONTACT, SOCIAL_LINKS } from './site-constants';

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    legalName: 'ElecIO Smart DNC',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.webp`,
    email: CONTACT.email,
    sameAs: [SOCIAL_LINKS.linkedin, SOCIAL_LINKS.instagram, SOCIAL_LINKS.telegram],
  };
}

export function websiteJsonLd(locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: locale === 'fa' ? 'fa-IR' : 'en-US',
    publisher: { '@id': ORGANIZATION_ID },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

// No `offers`/`aggregateRating`/`review` — pricing is request-based and no review data exists
// yet (doc/business_path.md §1). Add `offers` only once a real, public price exists.
export function productJsonLd(locale: string, opts: { name: string; description: string; image: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: opts.name,
    description: opts.description,
    image: `${SITE_URL}${opts.image}`,
    brand: { '@id': ORGANIZATION_ID },
    manufacturer: { '@id': ORGANIZATION_ID },
    url: `${SITE_URL}/${locale}/product`,
  };
}

export function jsonLdScript(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
