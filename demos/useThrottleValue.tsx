'use client';

import { useState } from 'react';
import { useThrottleValue } from '@/hooks/useThrottleValue';

const WAIT_OPTIONS = [100, 250, 500] as const;

export default function UseThrottleValueDemo() {
  const [waitIdx, setWaitIdx] = useState(1);
  const wait = WAIT_OPTIONS[waitIdx];

  const [value, setValue] = useState(50);
  const [throttledValue] = useThrottleValue(value, wait);

  const isSyncing = value !== throttledValue;

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

        <div className="relative flex h-28 w-64 flex-col justify-between border border-fd-primary/25 bg-fd-card/70 p-3.5 shadow-2xs backdrop-blur-[2px]">
          <span
            aria-hidden="true"
            className="absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isSyncing ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isSyncing ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isSyncing ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-px -right-px size-2 border-b-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isSyncing ? 1 : 0.45 }}
          />

          <div className="flex items-baseline justify-between font-mono tabular-nums">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-semibold tracking-tight text-fd-card-foreground">
                {throttledValue}
              </span>
              <span className="text-xs text-fd-muted-foreground">%</span>
            </div>
            <span className="text-[11px] text-fd-muted-foreground">
              live {value}%
            </span>
          </div>

          <div className="space-y-2">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-fd-muted">
              <div
                className="h-full w-full origin-left bg-fd-muted-foreground/45 will-change-transform"
                style={{
                  transform: `scale3d(${(value / 100).toFixed(3)}, 1, 1)`,
                }}
              />
            </div>

            <div className="h-1.5 w-full overflow-hidden rounded-full bg-fd-muted">
              <div
                className="h-full w-full origin-left bg-fd-primary transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-transform motion-reduce:transition-none"
                style={{
                  transform: `scale3d(${(throttledValue / 100).toFixed(3)}, 1, 1)`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-0.5 text-xs">
        <div className="flex min-w-[160px] flex-1 items-center gap-2.5 font-mono tabular-nums">
          <input
            type="range"
            min={0}
            max={100}
            aria-label="Live input value"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="h-1.5 w-full max-w-[200px] cursor-pointer appearance-none rounded-full bg-fd-muted accent-fd-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-fd-muted-foreground">
            wait
          </span>
          <div
            role="group"
            aria-label="Throttle wait interval"
            className="relative grid grid-cols-3 rounded-lg border bg-fd-muted/50 p-0.5 font-mono text-[11px] tabular-nums"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/3)] rounded-[6px] bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
              style={{
                transform: `translate3d(${waitIdx * 100}%, 0, 0)`,
              }}
            />
            {WAIT_OPTIONS.map((ms, idx) => {
              const active = idx === waitIdx;
              return (
                <button
                  key={ms}
                  type="button"
                  onClick={() => setWaitIdx(idx)}
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
