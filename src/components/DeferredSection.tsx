import React, { Suspense, useEffect, useRef, useState } from 'react';

interface DeferredSectionProps {
  /** Anchor id the real section uses, so nav links work before it has loaded. */
  id?: string;
  /** Space to reserve so the page doesn't jump when the section arrives. */
  minHeight?: number;
  children: React.ReactNode;
  /** Also mount once the browser is idle (for small always-visible widgets like the chat button). */
  idle?: boolean;
}

const BACKGROUND_DELAY_MS = 6000;

// "Island" loading: below-the-fold sections mount when the visitor scrolls near them
// (or, with `idle`, once the browser is idle), so the first screen stays fast. Every section
// still loads in the background a few seconds after the page has finished loading.
export const DeferredSection: React.FC<DeferredSectionProps> = ({ id, minHeight = 600, children, idle = false }) => {
  const [ready, setReady] = useState(false);
  const placeholderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ready) return;
    let idleHandle: number | undefined;
    let timeoutHandle: number | undefined;
    const load = () => setReady(true);

    const el = placeholderRef.current;
    // Sections mount as the visitor scrolls toward them, so the first screen stays light.
    if (typeof IntersectionObserver === 'undefined') {
      load();
      return;
    }
    const observer = el
      ? new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && load(), {
          rootMargin: '400px 0px',
        })
      : null;
    if (observer && el) observer.observe(el);

    const loadWhenIdle = () => {
      if (typeof window.requestIdleCallback === 'function') {
        idleHandle = window.requestIdleCallback(load, { timeout: 3000 });
      } else {
        timeoutHandle = window.setTimeout(load, 300);
      }
    };
    // Small widgets load as soon as the browser is idle. Big sections still load in the
    // background, but only a few seconds after the page has loaded, once first paint is done.
    const startBackground = () => {
      if (idle) loadWhenIdle();
      else timeoutHandle = window.setTimeout(loadWhenIdle, BACKGROUND_DELAY_MS);
    };
    if (document.readyState === 'complete') startBackground();
    else window.addEventListener('load', startBackground, { once: true });

    return () => {
      observer?.disconnect();
      window.removeEventListener('load', startBackground);
      if (idleHandle !== undefined) window.cancelIdleCallback(idleHandle);
      if (timeoutHandle !== undefined) window.clearTimeout(timeoutHandle);
    };
  }, [ready, idle]);

  const placeholder = <div ref={placeholderRef} id={id} style={{ minHeight }} aria-hidden="true" />;

  if (!ready) return placeholder;
  return <Suspense fallback={<div id={id} style={{ minHeight }} aria-hidden="true" />}>{children}</Suspense>;
};
