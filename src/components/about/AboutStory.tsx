'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import styles from './AboutStory.module.css';

export type StoryChapter = {
  number: string;
  title: string;
  body: string;
  alt: string;
  image: string;
};

export function AboutStory({ chapters, label }: { chapters: StoryChapter[]; label: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const chapterRefs = useRef<Array<HTMLElement | null>>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const observers = chapterRefs.current.map((chapter, index) => {
      if (!chapter) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(index);
        },
        { rootMargin: '-38% 0px -38% 0px', threshold: 0 },
      );
      observer.observe(chapter);
      return observer;
    });
    return () => observers.forEach((observer) => observer?.disconnect());
  }, []);

  return (
    <div ref={wrapRef} className={styles.story}>
      <div className={styles.visualColumn}>
        <div className={styles.stickyVisual}>
          <span className={styles.progress}>{String(active + 1).padStart(2, '0')} / {String(chapters.length).padStart(2, '0')}</span>
          <div className={styles.frames}>
            {chapters.map((chapter, index) => (
              <figure key={chapter.number} className={index === active ? styles.frameActive : ''}>
                <Image src={chapter.image} alt={chapter.alt} fill sizes="(max-width: 800px) 100vw, 55vw" />
              </figure>
            ))}
          </div>
          <p>{label}</p>
        </div>
      </div>

      <div className={styles.chapterColumn}>
        {chapters.map((chapter, index) => (
          <article
            key={chapter.number}
            ref={(node) => { chapterRefs.current[index] = node; }}
            className={index === active ? styles.chapterActive : ''}
          >
            <span>{chapter.number}</span>
            <h3>{chapter.title}</h3>
            <p>{chapter.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
