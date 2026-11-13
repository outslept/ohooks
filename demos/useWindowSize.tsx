'use client';

import { useEffect, useRef, useState } from 'react';
import { useWindowSize } from '@/hooks/useWindowSize';

const THROTTLE_OPTIONS = [0, 100, 300] as const;

function getBreakpoint(width: number): string {
  if (width >= 1536) return '2xl';
  if (width >= 1280) return 'xl';
  if (width >= 1024) return 'lg';
  if (width >= 768) return 'md';
  if (width >= 640) return 'sm';
  return 'xs';
}

export default function UseWindowSizeDemo() {
  const [throttleIdx, setThrottleIdx] = useState(0);
  const throttleMs = THROTTLE_OPTIONS[throttleIdx];

  const { width, height } = useWindowSize({ throttleMs });
  const [isResizing, setIsResizing] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setIsResizing(true);
    const id = window.setTimeout(() => setIsResizing(false), 180);
    return () => window.clearTimeout(id);
  }, [width, height]);

  const ratio = height > 0 ? (width / height).toFixed(2) : '—';
  const breakpoint = getBreakpoint(width);

  const scaleX = width > 0 ? Math.min(1, Math.max(0.28, width / 1920)) : 0.75;
  const scaleY = height > 0 ? Math.min(1, Math.max(0.32, height / 1080)) : 0.75;

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border bg-fd-card p-4 text-fd-card-foreground shadow-xs">
      <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-lg border bg-fd-muted/30">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute h-32 w-56 border border-fd-primary/25 bg-fd-card/70 shadow-2xs backdrop-blur-[2px] will-change-transform"
          style={{
            transform: `scale3d(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)}, 1)`,
          }}
        >
          <span
            className="absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isResizing ? 1 : 0.45 }}
          />
          <span
            className="absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isResizing ? 1 : 0.45 }}
          />
          <span
            className="absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isResizing ? 1 : 0.45 }}
          />
          <span
            className="absolute -bottom-px -right-px size-2 border-b-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isResizing ? 1 : 0.45 }}
          />
        </div>

        <div
          className="relative z-10 flex items-baseline gap-1.5 font-mono tabular-nums transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
          style={{
            transform: isResizing ? 'scale(1.02)' : 'scale(1)',
          }}
        >
          <span className="text-2xl font-semibold tracking-tight text-fd-card-foreground">
            {width}
          </span>
          <span className="text-sm text-fd-muted-foreground">×</span>
          <span className="text-2xl font-semibold tracking-tight text-fd-card-foreground">
            {height}
          </span>
          <span className="ml-0.5 text-xs text-fd-muted-foreground">px</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-2 font-mono text-fd-muted-foreground tabular-nums">
          <span
            key={breakpoint}
            className="animate-in fade-in zoom-in-95 inline-flex items-center rounded-md bg-fd-primary/10 px-2 py-0.5 font-semibold text-fd-primary duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:animate-none"
          >
            {breakpoint}
          </span>
          <span aria-hidden="true" className="text-fd-border">
            ·
          </span>
          <span>{ratio}:1</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-fd-muted-foreground">
            throttleMs
          </span>
          <div
            role="group"
            aria-label="Throttle interval"
            className="relative grid grid-cols-3 rounded-lg border bg-fd-muted/50 p-0.5 font-mono text-[11px] tabular-nums"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/3)] rounded-[6px] bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
              style={{
                transform: `translate3d(${throttleIdx * 100}%, 0, 0)`,
              }}
            />
            {THROTTLE_OPTIONS.map((ms, idx) => {
              const active = idx === throttleIdx;
              return (
                <button
                  key={ms}
                  type="button"
                  onClick={() => setThrottleIdx(idx)}
                  className={`relative z-10 rounded-[6px] px-2 py-1 text-center font-medium transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
                    active
                      ? 'text-fd-card-foreground'
                      : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-card-foreground'
                  }`}
                >
                  {ms}ms
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
