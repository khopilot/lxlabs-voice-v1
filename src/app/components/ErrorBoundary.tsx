"use client";

import React from 'react';

type Props = { children: React.ReactNode };
type State = { hasError: boolean; message?: string };

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, message: String(error?.message || error) };
  }

  componentDidCatch(error: any, info: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('UI ErrorBoundary caught:', error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center text-red-200 bg-red-900/40 border border-red-700 rounded-lg m-4">
          <div className="font-semibold mb-2">Something went wrong.</div>
          <div className="text-sm opacity-80">{this.state.message || 'Please reload the page.'}</div>
        </div>
      );
    }
    return this.props.children as any;
  }
}

