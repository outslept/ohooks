'use client';

import { Check, Loader2, Play, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useSpinDelay } from '@/hooks/useSpinDelay';

const DURATION_OPTIONS = [180, 450, 900] as const;
const DELAY_MS = 350;
const MIN_DURATION_MS = 500;

export default function UseSpinDelayDemo() {
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState<number>(180);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const barAnimRef = useRef<Animation | null>(null);

  const showSmartSpinner = useSpinDelay(isLoading, {
    delay: DELAY_MS,
    minDuration: MIN_DURATION_MS,
  });

  const clearSimulationTimer = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const animateBar = (ms: number) => {
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
      [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
      { duration: ms, easing: 'linear' }
    );
  };

  const simulateFetch = (durationMs = duration) => {
    clearSimulationTimer();
    setIsLoading(true);
    animateBar(durationMs);
    timerRef.current = setTimeout(() => {
      setIsLoading(false);
      timerRef.current = null;
    }, durationMs);
  };

  const toggleManualLoad = () => {
    clearSimulationTimer();
    barAnimRef.current?.cancel();
    setIsLoading((prev) => !prev);
  };

  useEffect(() => {
    return () => {
      clearSimulationTimer();
      barAnimRef.current?.cancel();
    };
  }, []);

  const phaseLabel =
    isLoading && !showSmartSpinner
      ? 'delay window'
      : isLoading && showSmartSpinner
        ? 'displaying'
        : !isLoading && showSmartSpinner
          ? 'min-duration hold'
          : 'idle';

  const durationIndex = Math.max(
    0,
    DURATION_OPTIONS.indexOf(duration as (typeof DURATION_OPTIONS)[number])
  );
  const thresholdPercent = Math.min(100, Math.round((DELAY_MS / 900) * 100));

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

        <div className="relative flex w-72 max-w-[calc(100%-1.5rem)] flex-col gap-3 border border-fd-primary/25 bg-fd-card/70 p-3.5 shadow-2xs backdrop-blur-[2px]">
          <span
            className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: showSmartSpinner ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: showSmartSpinner ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: showSmartSpinner ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: showSmartSpinner ? 1 : 0.45 }}
          />

          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-wider uppercase text-fd-muted-foreground">
              <span
                className={`size-1.5 rounded-full transition-colors duration-150 ease-out ${
                  showSmartSpinner || isLoading
                    ? 'bg-fd-primary'
                    : 'bg-fd-muted-foreground/40'
                }`}
              />
              {phaseLabel}
            </span>
            <span className="font-mono text-[10px] tabular-nums text-fd-muted-foreground">
              delay {DELAY_MS}ms · min {MIN_DURATION_MS}ms
            </span>
          </div>

          <div className="grid grid-cols-2 items-center gap-2 border-y border-fd-border/60 py-2.5">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-medium tracking-wider uppercase text-fd-muted-foreground">
                Raw loading
              </span>
              <div className="relative flex h-6 items-center">
                <span
                  className={`inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-amber-500 transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none ${
                    isLoading
                      ? 'scale-100 opacity-100'
                      : 'pointer-events-none absolute scale-95 opacity-0'
                  }`}
                >
                  <Loader2 className="size-3.5 animate-spin motion-reduce:animate-none" />
                  Spinning
                </span>
                <span
                  className={`inline-flex items-center gap-1 font-mono text-xs text-fd-muted-foreground transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none ${
                    !isLoading
                      ? 'scale-100 opacity-100'
                      : 'pointer-events-none absolute scale-95 opacity-0'
                  }`}
                >
                  <Check className="size-3" />
                  Idle
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1 border-l border-fd-border/60 pl-3">
              <span className="text-[10px] font-medium tracking-wider uppercase text-fd-primary">
                useSpinDelay
              </span>
              <div className="relative flex h-6 items-center">
                <span
                  className={`inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-fd-primary transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none ${
                    showSmartSpinner
                      ? 'scale-100 opacity-100'
                      : 'pointer-events-none absolute scale-95 opacity-0'
                  }`}
                >
                  <Loader2 className="size-3.5 animate-spin motion-reduce:animate-none" />
                  Visible
                </span>
                <span
                  className={`inline-flex items-center gap-1 font-mono text-xs text-fd-muted-foreground transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none ${
                    !showSmartSpinner
                      ? 'scale-100 opacity-100'
                      : 'pointer-events-none absolute scale-95 opacity-0'
                  }`}
                >
                  <Check className="size-3" />
                  Suppressed
                </span>
              </div>
            </div>
          </div>

          <div className="relative h-1 w-full overflow-hidden rounded-full bg-fd-muted">
            <div
              ref={barRef}
              className="h-full w-full origin-left scale-x-0 bg-fd-primary"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-fd-card-foreground/40"
              style={{ left: `${thresholdPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => simulateFetch(duration)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15"
          >
            <Play className="size-3" />
            Simulate ({duration}ms)
          </button>

          <button
            type="button"
            onClick={toggleManualLoad}
            className="inline-flex items-center gap-1 rounded-lg border bg-fd-muted/40 px-2.5 py-1 text-[11px] font-medium text-fd-card-foreground transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted"
          >
            <Square className="size-2.5" />
            {isLoading ? 'Stop' : 'Hold'}
          </button>
        </div>

        <div
          role="group"
          aria-label="Simulated request duration"
          className="relative grid grid-cols-3 rounded-lg border bg-fd-muted/50 p-0.5"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/3)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${durationIndex * 100}%, 0, 0)`,
            }}
          />
          {DURATION_OPTIONS.map((ms) => {
            const active = duration === ms;
            return (
              <button
                key={ms}
                type="button"
                onClick={() => {
                  setDuration(ms);
                  simulateFetch(ms);
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
