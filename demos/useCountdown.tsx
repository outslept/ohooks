'use client';

import { useState } from 'react';
import { useCountdown } from '@/hooks/useCountdown';

const COUNT_START = 15;
const INTERVAL_OPTIONS = [
  { value: 1000, label: '1000ms' },
  { value: 200, label: '200ms' },
] as const;

export default function UseCountdownDemo() {
  const [intervalMs, setIntervalMs] = useState<number>(1000);
  const { count, isRunning, start, pause, reset } = useCountdown({
    countStart: COUNT_START,
    countStop: 0,
    intervalMs,
  });

  const progress = count / COUNT_START;
  const activeIntervalIdx = INTERVAL_OPTIONS.findIndex(
    (o) => o.value === intervalMs,
  );

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border bg-fd-card p-4 text-fd-card-foreground shadow-xs">
      <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-lg border bg-fd-muted/30">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        <div className="relative flex w-56 flex-col gap-2.5 border border-fd-primary/25 bg-fd-card/85 px-4 py-3.5 shadow-2xs backdrop-blur-[2px]">
          <span
            className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isRunning ? 1 : 0.4 }}
          />
          <span
            className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isRunning ? 1 : 0.4 }}
          />
          <span
            className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isRunning ? 1 : 0.4 }}
          />
          <span
            className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isRunning ? 1 : 0.4 }}
          />

          <div className="flex items-center justify-between">
            <span className="font-mono text-2xl font-semibold tabular-nums tracking-tight text-fd-foreground">
              00:{String(count).padStart(2, '0')}
            </span>

            <span
              className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider uppercase transition-colors duration-150 ease-out ${
                isRunning
                  ? 'bg-fd-primary/15 text-fd-primary'
                  : count === 0
                    ? 'bg-emerald-500/15 text-emerald-500'
                    : 'bg-fd-muted text-fd-muted-foreground'
              }`}
            >
              {isRunning ? 'Running' : count === 0 ? 'Done' : 'Paused'}
            </span>
          </div>

          <div className="h-1 w-full overflow-hidden rounded-full bg-fd-muted">
            <div
              className="h-full w-full origin-left bg-fd-primary transition-transform duration-150 ease-out motion-reduce:transition-none"
              style={{
                transform: `scale3d(${progress}, 1, 1)`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={isRunning ? pause : start}
            disabled={count === 0}
            className="rounded-lg bg-fd-primary/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-fd-primary transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/20 motion-reduce:transition-none"
          >
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button
            type="button"
            onClick={reset}
            disabled={!isRunning && count === COUNT_START}
            className="rounded-lg border bg-fd-muted/40 px-2.5 py-1 font-mono text-[11px] font-medium text-fd-card-foreground transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted/70 motion-reduce:transition-none"
          >
            Reset
          </button>
        </div>

        <div
          role="group"
          aria-label="Tick interval"
          className="relative grid grid-cols-2 rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/2)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activeIntervalIdx * 100}%, 0, 0)`,
            }}
          />
          {INTERVAL_OPTIONS.map((option) => {
            const active = intervalMs === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setIntervalMs(option.value)}
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
