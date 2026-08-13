'use client';

import { useTranslations } from 'next-intl';
import { MailOutlined, PhoneOutlined, LinkedinOutlined, InstagramOutlined, SendOutlined } from '@ant-design/icons';
import { CONTACT, SOCIAL_LINKS } from '@/lib/site-constants';
import styles from './SiteFooter.module.css';
import { usePathname } from '@/i18n/navigation';
import { PrivacyPreferences } from './PrivacyPreferences';

export function SiteFooter() {
  const t = useTranslations('footer');
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  return (
    <footer className={styles.footer}>
      <PrivacyPreferences />
      <div className={styles.inner}>
        <div>
          <h3 className={styles.heading}>{t('contactTitle')}</h3>
          <ul className={styles.list}>
            <li>
              <a href={`mailto:${CONTACT.email}`}>
                <MailOutlined /> {CONTACT.email}
              </a>
            </li>
            {CONTACT.phones.map((phone) => (
              <li key={phone.number}>
                <a href={phone.href}>
                  <PhoneOutlined /> {phone.number} — {phone.name}
                </a>
              </li>
            ))}
          </ul>
          <p className={styles.address}>{t('address')}</p>
        </div>

        <div>
          <h3 className={styles.heading}>{t('socialTitle')}</h3>
          <ul className={styles.list}>
            <li>
              <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer">
                <LinkedinOutlined /> LinkedIn
              </a>
            </li>
            <li>
              <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer">
                <InstagramOutlined /> Instagram
              </a>
            </li>
            <li>
              <a href={SOCIAL_LINKS.telegram} target="_blank" rel="noopener noreferrer">
                <SendOutlined /> Telegram
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>{t('rights')}</div>
    </footer>
  );
}
