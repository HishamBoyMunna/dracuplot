import { useEffect, useState } from 'react';

/** Fades `.reveal` blocks in once, unless the reader asked for less motion. */
export function useReveal() {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced || !('IntersectionObserver' in window)) {
      nodes.forEach((node) => node.classList.add('is-in'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.06, rootMargin: '0px 0px -6% 0px' },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
}

/** How far through the file the reader has got, 0–100. */
export function useReadProgress(): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? window.scrollY / max : 0;
      setProgress(Math.min(100, Math.max(0, Math.round(ratio * 100))));
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return progress;
}

/** Which section is currently under the rail. */
export function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState(ids[0] ?? '');

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const line = window.innerHeight * 0.28;
      let current = ids[0] ?? '';

      for (const id of ids) {
        const node = document.getElementById(id);
        if (!node) continue;
        const top = node.getBoundingClientRect().top;
        if (top - line <= 0) current = id;
      }

      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom && ids.length > 0) current = ids[ids.length - 1];

      setActive(current);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [ids]);

  return active;
}
