import type { ReactNode } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { ORDER_URL } from '@/lib/site-constants';
import { RevealOnScroll } from './RevealOnScroll';
import styles from './PersonaExperience.module.css';

type StoryStep = {
  label: string;
  title: string;
  body: string;
  points: string[];
};

type Outcome = {
  title: string;
  body: string;
};

export type PersonaPageCopy = {
  eyebrow: string;
  headline: string;
  subheadline: string;
  ctaPrimary: string;
  ctaSecondary: string;
  imageAlts: string[];
  heroHighlights: string[];
  story: {
    eyebrow: string;
    title: string;
    body: string;
    steps: StoryStep[];
  };
  outcomes: {
    eyebrow: string;
    title: string;
    body: string;
    items: Outcome[];
  };
};

export function PersonaExperience({
  copy,
  images,
  tone,
  heroFooter,
}: {
  copy: PersonaPageCopy;
  images: readonly string[];
  tone: 'owner' | 'programmer' | 'operator';
  heroFooter?: ReactNode;
}) {
  return (
    <div className={styles.experience} data-persona-page="" data-tone={tone}>
      <header className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroGrid}>
          <RevealOnScroll className={styles.heroCopy}>
            <p className={styles.eyebrow}>{copy.eyebrow}</p>
            <h1 className={styles.headline}>{copy.headline}</h1>
            <p className={styles.subheadline}>{copy.subheadline}</p>

            <ul className={styles.heroHighlights}>
              {copy.heroHighlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <div className={styles.actions}>
              <a className={styles.primaryAction} href={ORDER_URL} target="_blank" rel="noopener noreferrer">
                {copy.ctaPrimary}
                <span aria-hidden="true">↗</span>
              </a>
              <Link className={styles.secondaryAction} href="/contact">
                {copy.ctaSecondary}
              </Link>
            </div>
            {heroFooter ? <div className={styles.heroFooter}>{heroFooter}</div> : null}
          </RevealOnScroll>

          <RevealOnScroll className={styles.portraitCollage} delayMs={120}>
            <figure className={styles.mainPortrait}>
              <Image
                src={images[0]}
                alt={copy.imageAlts[0]}
                fill
                preload
                sizes="(max-width: 760px) 66vw, (max-width: 1100px) 42vw, 370px"
              />
              <span className={styles.photoIndex}>01</span>
            </figure>
            <div className={styles.supportingPortraits}>
              {images.slice(1, 3).map((image, index) => (
                <figure className={styles.supportingPortrait} key={image}>
                  <Image
                    src={image}
                    alt={copy.imageAlts[index + 1]}
                    fill
                    loading="eager"
                    sizes="(max-width: 760px) 31vw, (max-width: 1100px) 22vw, 190px"
                  />
                  <span className={styles.photoIndex}>0{index + 2}</span>
                </figure>
              ))}
            </div>
            <div className={styles.visualCaption}>
              <span className="latin">ELECIO</span>
              <span>{copy.eyebrow}</span>
            </div>
          </RevealOnScroll>
        </div>
      </header>

      <section className={styles.storySection}>
        <RevealOnScroll className={styles.sectionHead}>
          <p className={styles.eyebrow}>{copy.story.eyebrow}</p>
          <h2>{copy.story.title}</h2>
          <p>{copy.story.body}</p>
        </RevealOnScroll>

        <div className={styles.storyList}>
          {copy.story.steps.map((step, index) => (
            <RevealOnScroll className={styles.storyStep} delayMs={index * 70} key={step.label}>
              <figure className={styles.storyImage}>
                <Image
                  src={images[index]}
                  alt={copy.imageAlts[index]}
                  fill
                  sizes="(max-width: 760px) 100vw, 45vw"
                />
                <span className={styles.stepNumber}>0{index + 1}</span>
              </figure>
              <div className={styles.storyCopy}>
                <p className={styles.stepLabel}>{step.label}</p>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
                <ul>
                  {step.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      <section className={styles.outcomesSection}>
        <div className={styles.outcomesShell}>
          <RevealOnScroll className={styles.outcomesIntro}>
            <p className={styles.eyebrow}>{copy.outcomes.eyebrow}</p>
            <h2>{copy.outcomes.title}</h2>
            <p>{copy.outcomes.body}</p>
          </RevealOnScroll>
          <div className={styles.outcomeGrid}>
            {copy.outcomes.items.map((item, index) => (
              <RevealOnScroll className={styles.outcomeCard} delayMs={index * 60} key={item.title}>
                <span className={styles.outcomeIndex}>0{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
