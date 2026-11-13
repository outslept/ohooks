'use client';

import { useRef, useState } from 'react';
import { useElementScroll } from '@/hooks/useElementScroll';

const THROTTLE_OPTIONS = [
  { value: 0, label: '0ms' },
  { value: 80, label: '80ms' },
] as const;

const TRACK_HEIGHT = 480;
const RULER_STEPS = [0, 80, 160, 240, 320, 400];

export default function UseElementScrollDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [throttleMs, setThrottleMs] = useState<number>(0);

  const { y, isScrolling, directions, arrived, scrollTo } = useElementScroll(
    containerRef,
    { throttleMs },
  );

  const jumpTo = (fraction: number) => {
    const el = containerRef.current;
    if (!el) return;
    const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight);
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    scrollTo({
      top: Math.round(maxScroll * fraction),
      behavior: reduced ? 'auto' : 'smooth',
    });
  };

  const el = containerRef.current;
  const maxScroll = el ? Math.max(1, el.scrollHeight - el.clientHeight) : 304;
  const progress = Math.min(1, Math.max(0, y / maxScroll));
  const activeThrottleIdx = THROTTLE_OPTIONS.findIndex(
    (o) => o.value === throttleMs,
  );

  const statusLabel = isScrolling
    ? directions.bottom
      ? '↓ DOWN'
      : directions.top
        ? '↑ UP'
        : 'SCROLL'
    : arrived.top
      ? 'TOP'
      : arrived.bottom
        ? 'BOTTOM'
        : 'IDLE';

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border bg-fd-card p-4 text-fd-card-foreground shadow-xs">
      <div className="relative h-44 w-full overflow-hidden rounded-lg border bg-fd-muted/30">
        <div
          ref={containerRef}
          className="h-full w-full overflow-y-auto overscroll-contain"
        >
          <div
            className="relative w-full"
            style={{ height: `${TRACK_HEIGHT}px` }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-35"
              style={{
                backgroundImage:
                  'radial-gradient(currentColor 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            />

            {RULER_STEPS.map((step) => (
              <div
                key={step}
                style={{ top: `${step + 16}px` }}
                className="pointer-events-none absolute right-3 left-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-1.5">
                  <span className="h-px w-2.5 bg-fd-border" />
                  <span className="font-mono text-[10px] tabular-nums text-fd-muted-foreground/70">
                    {String(step).padStart(3, '0')}
                  </span>
                </div>
                <span className="h-px w-2.5 bg-fd-border" />
              </div>
            ))}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative flex w-48 flex-col gap-1.5 border border-fd-primary/25 bg-fd-card/85 px-4 py-2.5 shadow-2xs backdrop-blur-xs">
            <span
              className="absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
              style={{ opacity: isScrolling ? 1 : 0.4 }}
            />
            <span
              className="absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
              style={{ opacity: isScrolling ? 1 : 0.4 }}
            />
            <span
              className="absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
              style={{ opacity: isScrolling ? 1 : 0.4 }}
            />
            <span
              className="absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
              style={{ opacity: isScrolling ? 1 : 0.4 }}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-1 font-mono tabular-nums">
                <span className="text-[11px] text-fd-muted-foreground">y</span>
                <span className="text-base font-semibold tracking-tight text-fd-foreground">
                  {Math.round(y)}
                </span>
                <span className="text-[10px] text-fd-muted-foreground">px</span>
              </div>

              <span
                className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider transition-colors duration-150 ease-out ${
                  isScrolling
                    ? 'bg-fd-primary/15 text-fd-primary'
                    : 'bg-fd-muted text-fd-muted-foreground'
                }`}
              >
                {statusLabel}
              </span>
            </div>

            <div className="h-1 w-full overflow-hidden rounded-full bg-fd-muted">
              <div
                className="h-full w-full origin-left bg-fd-primary"
                style={{
                  transform: `scale3d(${progress}, 1, 1)`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => jumpTo(0)}
            disabled={arrived.top}
            className="rounded-lg border bg-fd-muted/40 px-2.5 py-1 font-mono text-[11px] font-medium text-fd-card-foreground transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted/70 motion-reduce:transition-none"
          >
            Top
          </button>
          <button
            type="button"
            onClick={() => jumpTo(0.5)}
            className="rounded-lg border bg-fd-muted/40 px-2.5 py-1 font-mono text-[11px] font-medium text-fd-card-foreground transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted/70 motion-reduce:transition-none"
          >
            50%
          </button>
          <button
            type="button"
            onClick={() => jumpTo(1)}
            disabled={arrived.bottom}
            className="rounded-lg border bg-fd-muted/40 px-2.5 py-1 font-mono text-[11px] font-medium text-fd-card-foreground transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted/70 motion-reduce:transition-none"
          >
            Bottom
          </button>
        </div>

        <div
          role="group"
          aria-label="Throttle interval"
          className="relative grid grid-cols-2 rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/2)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activeThrottleIdx * 100}%, 0, 0)`,
            }}
          />
          {THROTTLE_OPTIONS.map((option) => {
            const active = throttleMs === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setThrottleMs(option.value)}
                className={`relative z-10 rounded-md px-2 py-0.5 font-mono text-[11px] font-medium tabular-nums transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
                  active
                    ? 'text-fd-foreground'
                    : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-foreground'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
