'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button, Drawer, Menu } from 'antd';
import { MenuOutlined, GlobalOutlined, BulbOutlined, BulbFilled } from '@ant-design/icons';
import Image from 'next/image';
import { Link, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { ORDER_URL } from '@/lib/site-constants';
import { useThemeMode } from '@/lib/theme-context';
import styles from './SiteHeader.module.css';

export function SiteHeader() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { mode, toggle } = useThemeMode();

  if (pathname.startsWith('/admin/social/instagram')) return null;

  const items = [
    { key: '/', label: t('home') },
    { key: '/product', label: t('product') },
    { key: '/software', label: t('software') },
    { key: '/blog', label: t('blog') },
    { key: '/documents', label: t('documents') },
    { key: '/about', label: t('about') },
    { key: '/contact', label: t('contact') },
  ];
  const otherLocale = routing.locales.find((l) => l !== locale)!;

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <Image
            src={mode === 'light' ? '/images/logo-light-header.webp' : '/images/logo-dark-header.webp'}
            alt="ElecIO"
            width={420}
            height={125}
            sizes="(max-width: 768px) 82px, 112px"
            priority
            className={`${styles.logoImg} ${styles.logoImgTheme}`}
          />
        </Link>

        <Menu
          mode="horizontal"
          selectedKeys={[pathname]}
          items={items.map((item) => ({
            key: item.key,
            label: <Link href={item.key}>{item.label}</Link>,
          }))}
          className={styles.desktopMenu}
          style={{ background: 'transparent' }}
        />

        <div className={styles.actions}>
          <Link
            href={pathname}
            locale={otherLocale}
            className={styles.localeSwitch}
            aria-label={otherLocale === 'fa' ? 'تغییر زبان به فارسی' : 'Switch language to English'}
            title={otherLocale === 'fa' ? 'فارسی' : 'English'}
          >
            <GlobalOutlined />
            <span className={styles.localeLabel}>{otherLocale === 'fa' ? 'فا' : 'EN'}</span>
          </Link>
          {/* Hidden below 768px (SiteHeader.module.css) — the mobile pill only has room for the
              order button + hamburger before it starts crowding/overlapping (found via a real
              mobile screenshot, doc/journey.md 2026-08-07 round 8). Reachable on mobile from
              inside the drawer instead, not dropped. */}
          <Button
            className={styles.themeToggle}
            icon={mode === 'dark' ? <BulbOutlined /> : <BulbFilled />}
            onClick={toggle}
            aria-label={mode === 'dark' ? t('lightMode') : t('darkMode')}
            title={mode === 'dark' ? t('lightMode') : t('darkMode')}
          />
          <Button className={styles.orderButton} type="primary" href={ORDER_URL} target="_blank" rel="noopener noreferrer">
            {t('order')}
          </Button>
          <Button
            className={styles.mobileMenuButton}
            icon={<MenuOutlined />}
            onClick={() => setOpen(true)}
            aria-label="menu"
          />
        </div>
      </div>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        placement={locale === 'fa' ? 'right' : 'left'}
        title="ElecIO"
      >
        <Menu
          mode="vertical"
          selectedKeys={[pathname]}
          items={items.map((item) => ({
            key: item.key,
            label: (
              <Link href={item.key} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ),
          }))}
        />
        <Button
          block
          className={styles.drawerThemeToggle}
          icon={mode === 'dark' ? <BulbOutlined /> : <BulbFilled />}
          onClick={toggle}
        >
          {mode === 'dark' ? t('lightMode') : t('darkMode')}
        </Button>
      </Drawer>
    </header>
  );
}
