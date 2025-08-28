"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useTranscript } from '@/app/contexts/TranscriptContext';

export default function CoachTipToast() {
  const { transcriptItems } = useTranscript();
  const latest = useMemo(() => {
    // Find the newest breadcrumb generated for evaluateSoftSkills
    const tips = transcriptItems
      .filter((i) => i.type === 'BREADCRUMB' && (i.title || '').includes('function call result: evaluateSoftSkills'))
      .sort((a, b) => b.createdAtMs - a.createdAtMs);
    const last = tips[0];
    const data = (last?.data ?? {}) as any;
    // Data may be nested or text – normalize
    if (!data) return null;
    const one_tip = data?.one_tip || data?.output_parsed?.one_tip || data?.output?.one_tip || data?.output_text;
    const next_prompt = data?.next_prompt || data?.output_parsed?.next_prompt;
    const warmth = data?.warmth ?? data?.output_parsed?.warmth;
    return one_tip ? { one_tip, next_prompt, warmth, ts: last?.createdAtMs } : null;
  }, [transcriptItems]);

  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (latest?.ts) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 5000);
      return () => clearTimeout(t);
    }
  }, [latest?.ts]);

  if (!visible || !latest) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-30">
      <div className="rounded-xl bg-emerald-900/80 text-emerald-50 border border-emerald-600 shadow-lg px-4 py-3 max-w-md">
        <div className="text-sm font-semibold mb-1">Coach Tip</div>
        <div className="text-sm">{latest.one_tip}</div>
        {latest.next_prompt && (
          <div className="text-xs mt-2 opacity-90">Try now: “{latest.next_prompt}”</div>
        )}
      </div>
    </div>
  );
}

