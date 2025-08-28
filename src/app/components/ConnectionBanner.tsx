"use client";

import React from 'react';

type Props = {
  status: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED';
  onRetry?: () => void;
};

export default function ConnectionBanner({ status, onRetry }: Props) {
  if (status === 'CONNECTED') return null;
  const isConnecting = status === 'CONNECTING';
  return (
    <div className={`fixed top-0 inset-x-0 z-30 ${isConnecting ? 'bg-yellow-900/60 border-yellow-600' : 'bg-red-900/60 border-red-700'} border-b backdrop-blur-md`}> 
      <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between text-sm text-white/90">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isConnecting ? 'bg-yellow-400 animate-pulse' : 'bg-red-400'}`} />
          <span>{isConnecting ? 'Connecting to training session…' : 'Disconnected from training session'}</span>
        </div>
        {!isConnecting && onRetry && (
          <button onClick={onRetry} className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/20">Retry</button>
        )}
      </div>
    </div>
  );
}

