"use client";

import { useEffect } from 'react';

type VitalsMetric = {
  name: string;
  value: number;
};

export function useWebVitalsLogger(enabled: boolean = process.env.NODE_ENV !== 'production') {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    const log = (m: VitalsMetric) => {
      // Keep it lightweight – dev-only console log
      // eslint-disable-next-line no-console
      console.log(`[Vitals] ${m.name}:`, Math.round(m.value));
    };

    const obs = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          log({ name: 'LCP', value: (entry as any).renderTime || (entry as any).loadTime || entry.startTime });
        } else if (entry.entryType === 'layout-shift') {
          const shift = entry as any;
          if (!shift.hadRecentInput) log({ name: 'CLS', value: shift.value });
        } else if (entry.entryType === 'first-input') {
          log({ name: 'FID', value: entry.processingStart - entry.startTime });
        }
      }
    });

    try {
      obs.observe({ type: 'largest-contentful-paint', buffered: true } as any);
      obs.observe({ type: 'layout-shift', buffered: true } as any);
      obs.observe({ type: 'first-input', buffered: true } as any);
    } catch {
      // Some browsers might not support all types
    }

    return () => obs.disconnect();
  }, [enabled]);
}

