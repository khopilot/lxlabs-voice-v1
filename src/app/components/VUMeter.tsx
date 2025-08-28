"use client";

import React, { useEffect, useRef, useState } from 'react';

type Props = {
  active: boolean;
};

export default function VUMeter({ active }: Props) {
  const [level, setLevel] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setLevel(0);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) return;
        streamRef.current = stream;
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);

        const tick = () => {
          analyser.getByteTimeDomainData(data);
          // Compute RMS level from waveform
          let sum = 0;
          for (let i = 0; i < data.length; i++) {
            const v = (data[i] - 128) / 128;
            sum += v * v;
          }
          const rms = Math.sqrt(sum / data.length);
          setLevel(Math.min(1, rms * 3));
          rafRef.current = requestAnimationFrame(tick);
        };
        tick();
      } catch {
        // mic not available – keep silent
      }
    })();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [active]);

  const bars = 5;
  return (
    <div aria-hidden className="flex items-end gap-1 h-6">
      {Array.from({ length: bars }).map((_, i) => {
        const threshold = (i + 1) / bars;
        const h = level > threshold ? (i + 1) * 4 : (i + 1) * 2;
        const on = level > threshold;
        return <div key={i} className={`w-1 rounded-sm ${on ? 'bg-green-400' : 'bg-gray-600'}`} style={{ height: h }} />;
      })}
    </div>
  );
}

