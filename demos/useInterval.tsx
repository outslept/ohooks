'use client';

import { useRef, useState } from 'react';
import { useInterval } from '@/hooks/useInterval';

const DELAY_OPTIONS = [
  { label: 'null', value: null },
  { label: '200ms', value: 200 },
  { label: '500ms', value: 500 },
  { label: '1000ms', value: 1000 },
] as const;

export default function UseIntervalDemo() {
  const [ticks, setTicks] = useState(0);
  const [delay, setDelay] = useState<number | null>(500);
  const lastActiveDelayRef = useRef<number>(500);
  const frameRef = useRef<HTMLDivElement>(null);

  useInterval(() => {
    setTicks((t) => t + 1);

    if (
      frameRef.current &&
      typeof window !== 'undefined' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      frameRef.current.animate(
        [
          { transform: 'scale3d(1.03, 1.03, 1)' },
          { transform: 'scale3d(1, 1, 1)' },
        ],
        {
          duration: 180,
          easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
        },
      );
    }
  }, delay);

  const selectDelay = (next: number | null) => {
    if (next !== null) {
      lastActiveDelayRef.current = next;
    }
    setDelay(next);
  };

  const toggleRunning = () => {
    setDelay((current) =>
      current === null ? lastActiveDelayRef.current : null,
    );
  };

  const isRunning = delay !== null;
  const activeIdx = Math.max(
    0,
    DELAY_OPTIONS.findIndex((opt) => opt.value === delay),
  );

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border bg-fd-card p-4 text-fd-card-foreground shadow-xs">
      <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-lg border bg-fd-muted/30 px-4">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        <div
          ref={frameRef}
          className="relative z-10 flex min-w-48 flex-col items-center gap-1.5 border border-fd-primary/25 bg-fd-card/80 px-6 py-4 shadow-2xs backdrop-blur-[2px]"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isRunning ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isRunning ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isRunning ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isRunning ? 1 : 0.45 }}
          />

          <div className="flex items-center gap-1.5">
            <span
              className={`size-1.5 rounded-full transition-colors duration-150 ease-out ${
                isRunning ? 'bg-fd-primary' : 'bg-fd-muted-foreground/40'
              }`}
            />
            <span className="font-mono text-[10px] font-semibold tracking-wider text-fd-muted-foreground uppercase tabular-nums">
              {isRunning ? `every ${delay}ms` : 'paused (null)'}
            </span>
          </div>

          <span className="font-mono text-3xl font-semibold text-fd-card-foreground tabular-nums">
            {ticks}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleRunning}
            className="rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15 motion-reduce:transition-none"
          >
            {isRunning ? 'Pause' : 'Resume'}
          </button>
          <button
            type="button"
            onClick={() => setTicks(0)}
            disabled={ticks === 0}
            className="rounded-lg border bg-fd-muted/40 px-2.5 py-1 text-[11px] font-medium text-fd-card-foreground transition-[background-color,transform,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted/70 motion-reduce:transition-none"
          >
            Reset
          </button>
        </div>

        <div
          role="group"
          aria-label="Interval delay"
          className="relative grid grid-cols-4 rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/4)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activeIdx * 100}%, 0, 0)`,
            }}
          />
          {DELAY_OPTIONS.map((option) => {
            const active = delay === option.value;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => selectDelay(option.value)}
                className={`relative z-10 rounded-md px-2 py-1 font-mono text-[11px] font-medium tabular-nums transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
                  active
                    ? 'text-fd-card-foreground'
                    : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-card-foreground'
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
