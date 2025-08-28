"use client";

// Lightweight local persistence for per-student data.
// Falls back to in-memory only if window.localStorage is unavailable.

export function isBrowser(): boolean {
  return typeof window !== 'undefined' && !!window.localStorage;
}

export function loadProgress<T = any>(studentId: string): T | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(`lxl_progress_${studentId}`);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function saveProgress(studentId: string, data: any) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(`lxl_progress_${studentId}`, JSON.stringify(data));
  } catch {
    // ignore quota or serialization errors
  }
}

export function loadMetrics<T = any>(studentId: string): T | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(`lxl_metrics_${studentId}`);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function saveMetrics(studentId: string, data: any) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(`lxl_metrics_${studentId}`, JSON.stringify(data));
  } catch {
    // ignore
  }
}

