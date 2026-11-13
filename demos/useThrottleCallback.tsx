'use client';

import { RotateCcw, Zap } from 'lucide-react';
import { useRef, useState } from 'react';
import { useThrottleCallback } from '@/hooks/useThrottleCallback';

const WAIT_OPTIONS = [300, 600, 1000] as const;

export default function UseThrottleCallbackDemo() {
  const [wait, setWait] = useState<number>(600);
  const [rawClicks, setRawClicks] = useState(0);
  const [throttledRuns, setThrottledRuns] = useState(0);
  const [isPending, setIsPending] = useState(false);

  const frameRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const barAnimRef = useRef<Animation | null>(null);

  const pulseFrame = () => {
    const el = frameRef.current;
    if (!el) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    el.animate(
      [
        { transform: 'scale3d(1.025, 1.025, 1)' },
        { transform: 'scale3d(1, 1, 1)' },
      ],
      { duration: 220, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }
    );
  };

  const animateCooldownBar = (duration: number) => {
    const bar = barRef.current;
    if (!bar) return;
    barAnimRef.current?.cancel();
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    barAnimRef.current = bar.animate(
      [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }],
      { duration, easing: 'linear' }
    );
  };

  const stopCooldownBar = () => {
    barAnimRef.current?.cancel();
  };

  const throttledIncrement = useThrottleCallback(
    () => {
      setThrottledRuns((c) => c + 1);
      setIsPending(false);
      stopCooldownBar();
      pulseFrame();
    },
    wait,
    { leading: true, trailing: true }
  );

  const handleTrigger = () => {
    setRawClicks((c) => c + 1);
    throttledIncrement();
    const pendingNow = throttledIncrement.isPending();
    setIsPending(pendingNow);
    if (pendingNow) {
      animateCooldownBar(wait);
    }
  };

  const handleFlush = () => {
    throttledIncrement.flush();
    setIsPending(throttledIncrement.isPending());
    stopCooldownBar();
  };

  const handleCancel = () => {
    throttledIncrement.cancel();
    setIsPending(false);
    stopCooldownBar();
  };

  const handleReset = () => {
    throttledIncrement.cancel();
    stopCooldownBar();
    setRawClicks(0);
    setThrottledRuns(0);
    setIsPending(false);
  };

  const waitIndex = Math.max(
    0,
    WAIT_OPTIONS.indexOf(wait as (typeof WAIT_OPTIONS)[number])
  );

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border bg-fd-card p-4 text-fd-card-foreground shadow-xs">
      <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-lg border bg-fd-muted/30">
        <div
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        <div
          ref={frameRef}
          className="relative flex w-64 flex-col gap-3 border border-fd-primary/25 bg-fd-card/70 p-3.5 shadow-2xs backdrop-blur-[2px]"
        >
          <span
            className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isPending ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isPending ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isPending ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isPending ? 1 : 0.45 }}
          />

          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-wider uppercase text-fd-muted-foreground">
              <span
                className={`size-1.5 rounded-full transition-colors duration-150 ease-out ${
                  isPending ? 'bg-fd-primary' : 'bg-fd-muted-foreground/40'
                }`}
              />
              {isPending ? 'trailing queued' : 'ready'}
            </span>
            <span className="font-mono text-[10px] tabular-nums text-fd-muted-foreground">
              {wait}ms
            </span>
          </div>

          <div className="grid grid-cols-2 items-center gap-2 border-y border-fd-border/60 py-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-medium tracking-wider uppercase text-fd-muted-foreground">
                Raw Calls
              </span>
              <span className="font-mono text-2xl font-bold tabular-nums text-fd-card-foreground">
                {rawClicks}
              </span>
            </div>
            <div className="flex flex-col border-l border-fd-border/60 pl-3">
              <span className="text-[10px] font-medium tracking-wider uppercase text-fd-primary">
                Executed
              </span>
              <span className="font-mono text-2xl font-bold tabular-nums text-fd-primary">
                {throttledRuns}
              </span>
            </div>
          </div>

          <div className="h-1 w-full overflow-hidden rounded-full bg-fd-muted">
            <div
              ref={barRef}
              className="h-full w-full origin-left scale-x-0 bg-fd-primary"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleTrigger}
            className="inline-flex items-center gap-1.5 rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15"
          >
            <Zap className="size-3" />
            Trigger
          </button>

          <button
            type="button"
            onClick={handleFlush}
            disabled={!isPending}
            className="rounded-lg border bg-fd-muted/40 px-2.5 py-1 text-[11px] font-medium text-fd-card-foreground transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted"
          >
            Flush
          </button>

          <button
            type="button"
            onClick={handleCancel}
            disabled={!isPending}
            className="rounded-lg border bg-fd-muted/40 px-2.5 py-1 text-[11px] font-medium text-fd-card-foreground transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={rawClicks === 0}
            aria-label="Reset counters"
            className="inline-flex size-6 items-center justify-center rounded-lg border bg-fd-muted/40 text-fd-muted-foreground transition-[transform,color,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-card-foreground"
          >
            <RotateCcw className="size-3" />
          </button>
        </div>

        <div
          role="group"
          aria-label="Throttle interval"
          className="relative grid grid-cols-3 rounded-lg border bg-fd-muted/50 p-0.5"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/3)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${waitIndex * 100}%, 0, 0)`,
            }}
          />
          {WAIT_OPTIONS.map((ms) => {
            const active = wait === ms;
            return (
              <button
                key={ms}
                type="button"
                onClick={() => {
                  handleCancel();
                  setWait(ms);
                }}
                className={`relative z-10 rounded-md px-2 py-0.5 font-mono text-[11px] font-medium tabular-nums transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
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
  );
}
