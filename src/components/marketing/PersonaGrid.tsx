'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { CheckOutlined, CodeOutlined, CrownOutlined, ToolOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { PERSONA_STORY_IMAGES } from '@/lib/site-constants';
import { PERSONA_RETURN_HOME_TOP_KEY } from '@/lib/navigation-scroll';
import type { AppLocale } from '@/i18n/routing';
import { RevealOnScroll } from './RevealOnScroll';
import styles from './PersonaGrid.module.css';

type Persona = { title: string; description: string; brief: string; href: string; highlights: string[] };

const ICONS = [CrownOutlined, CodeOutlined, ToolOutlined];
// The commercial hierarchy is deliberate: owner first, then technical office, then operator.
// Translation data stays persona-based and reusable across their dedicated pages.
const STORY_ORDER = [0, 1, 2] as const;

function PersonaSlideshow({ images, persona, staggerIndex }: {
  images: readonly string[];
  persona: string;
  staggerIndex: number;
}) {
  const [active, setActive] = useState(0);
  const slideshowRef = useRef<HTMLDivElement>(null);
  const [onscreen, setOnscreen] = useState(false);

  useEffect(() => {
    const slideshow = slideshowRef.current;
    if (!slideshow) return;
    const observer = new IntersectionObserver(([entry]) => setOnscreen(entry.isIntersecting), {
      rootMargin: '100px 0px',
    });
    observer.observe(slideshow);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!onscreen || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Advance only one persona at a time: owner at 10s, programmer at 20s,
    // operator at 30s, then repeat that staggered sequence every 30s.
    let interval: number | undefined;
    const timeout = window.setTimeout(() => {
      setActive((current) => (current + 1) % images.length);
      interval = window.setInterval(
        () => setActive((current) => (current + 1) % images.length),
        30_000,
      );
    }, (staggerIndex + 1) * 10_000);

    return () => {
      window.clearTimeout(timeout);
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, [images.length, onscreen, staggerIndex]);

  return (
    <div ref={slideshowRef} className={styles.personaSlideshow}>
      {images.map((src, imageIndex) => (
        <Image
          key={src}
          src={src}
          alt={imageIndex === active ? persona : ''}
          fill
          sizes="(max-width: 720px) 92vw, 48vw"
          className={`${styles.slide} ${imageIndex === active ? styles.slideActive : ''}`}
          aria-hidden={imageIndex !== active}
        />
      ))}
      <div className={styles.imageShade} />
      <div className={styles.slideProgress} aria-hidden="true">
        {images.map((src, imageIndex) => (
          <i key={src} className={imageIndex === active ? styles.slideProgressActive : ''} />
        ))}
      </div>
    </div>
  );
}

export function PersonaGrid() {
  const t = useTranslations('personas');
  const locale = useLocale() as AppLocale;
  const items = t.raw('items') as Persona[];
  const personaImages = PERSONA_STORY_IMAGES[locale];

  return (
    <section className={styles.section}>
      <div className={styles.ambient} aria-hidden="true" />
      <div className={styles.container}>
        <RevealOnScroll className={styles.head}>
          <p className={styles.eyebrow}>{t('eyebrow')}</p>
          <h2 className={styles.title}>{t('title')}</h2>
          <p className={styles.intro}>{t('intro')}</p>
        </RevealOnScroll>

        <div className={styles.story}>
          <div className={styles.storyLine} aria-hidden="true" />
          {STORY_ORDER.map((itemIndex, storyIndex) => {
            const item = items[itemIndex];
            const Icon = ICONS[itemIndex];

            return (
              <RevealOnScroll key={item.title} className={styles.revealChapter}>
                <article className={styles.chapter}>
                  <div className={styles.mediaWrap}>
                    <div className={styles.stepGhost} aria-hidden="true">
                      {String(storyIndex + 1).padStart(2, '0')}
                    </div>
                    <div className={styles.media}>
                      <PersonaSlideshow
                        images={personaImages[itemIndex]}
                        persona={item.title}
                        staggerIndex={storyIndex}
                      />
                      <div className={styles.roleMark}>
                        <Icon />
                        <span>{item.title}</span>
                      </div>
                    </div>
                    <div className={styles.signalCard} aria-hidden="true">
                      <span className={styles.signalDot} />
                      <span className={styles.signalBars}><i /><i /><i /></span>
                    </div>
                  </div>

                  <div className={styles.content}>
                    <div className={styles.chapterMeta}>
                      <span>{String(storyIndex + 1).padStart(2, '0')}</span>
                      <i />
                      <span>{t(`steps.${storyIndex}`)}</span>
                    </div>
                    <h3>{item.title}</h3>
                    <p className={styles.lead}>{item.description}</p>
                    <p className={styles.brief}>{item.brief}</p>
                    <ul className={styles.highlights}>
                      {item.highlights.map((highlight) => (
                        <li key={highlight}>
                          <span><CheckOutlined /></span>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={item.href}
                      className={styles.cta}
                      onClick={() => {
                        window.sessionStorage.setItem(PERSONA_RETURN_HOME_TOP_KEY, '1');
                        if ('scrollRestoration' in window.history) {
                          window.history.scrollRestoration = 'manual';
                        }
                      }}
                    >
                      <span>{t('viewFullPage')}</span>
                      <span className={styles.ctaArrow} aria-hidden="true">→</span>
                    </Link>
                  </div>
                </article>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
