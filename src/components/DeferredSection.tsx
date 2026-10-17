import React, { Suspense, useEffect, useRef, useState } from 'react';

interface DeferredSectionProps {
  /** Anchor id the real section uses, so nav links work before it has loaded. */
  id?: string;
  /** Space to reserve so the page doesn't jump when the section arrives. */
  minHeight?: number;
  children: React.ReactNode;
}

// "Island" loading: below-the-fold sections mount when the visitor scrolls near
// them or the browser goes idle, whichever comes first, so the hero paints fast.
export const DeferredSection: React.FC<DeferredSectionProps> = ({ id, minHeight = 600, children }) => {
  const [ready, setReady] = useState(false);
  const placeholderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ready) return;
    let idleHandle: number | undefined;
    let timeoutHandle: number | undefined;
    const load = () => setReady(true);

    const el = placeholderRef.current;
    const observer =
      typeof IntersectionObserver !== 'undefined' && el
        ? new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && load(), {
            rootMargin: '800px 0px',
          })
        : null;
    if (observer && el) observer.observe(el);

    if (typeof window.requestIdleCallback === 'function') {
      idleHandle = window.requestIdleCallback(load, { timeout: 3000 });
    } else {
      timeoutHandle = window.setTimeout(load, 1500);
    }

    return () => {
      observer?.disconnect();
      if (idleHandle !== undefined) window.cancelIdleCallback(idleHandle);
      if (timeoutHandle !== undefined) window.clearTimeout(timeoutHandle);
    };
  }, [ready]);

  const placeholder = <div ref={placeholderRef} id={id} style={{ minHeight }} aria-hidden="true" />;

  if (!ready) return placeholder;
  return <Suspense fallback={<div id={id} style={{ minHeight }} aria-hidden="true" />}>{children}</Suspense>;
};
