import { useEffect, useState } from 'react';

const PORTRAIT_PHONE = '(max-width: 900px) and (orientation: portrait)';

/** True when a small device is being held upright. */
export function useIsPortraitPhone(): boolean {
  const [blocked, setBlocked] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(PORTRAIT_PHONE).matches,
  );

  useEffect(() => {
    const media = window.matchMedia(PORTRAIT_PHONE);
    const update = () => setBlocked(media.matches);

    media.addEventListener('change', update);
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    update();

    return () => {
      media.removeEventListener('change', update);
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  return blocked;
}
