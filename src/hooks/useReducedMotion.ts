import { useState, useEffect } from 'react';
import { useAtelier } from '../context/AtelierContext';

/** True when the OS asks for reduced motion OR the visitor enabled the in-site override. */
export function useReducedMotion(): boolean {
  const { prefs } = useAtelier();
  const [systemReduced, setSystemReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => setSystemReduced(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return systemReduced || prefs.forceReducedMotion;
}
