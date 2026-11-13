'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useIdle } from '@/hooks/useIdle';
import { useThrottleCallback } from '@/hooks/useThrottleCallback';

const TIMEOUT_OPTIONS = [
  { label: '1.5s', value: 1500 },
  { label: '3s', value: 3000 },
  { label: '5s', value: 5000 },
] as const;

const ACTIVITY_EVENTS: ReadonlyArray<keyof WindowEventMap> = [
  'mousemove',
  'mousedown',
  'resize',
  'keydown',
  'touchstart',
  'wheel',
];

const THROTTLE_MS = 150;

export default function UseIdleDemo() {
  const [timeoutMs, setTimeoutMs] = useState<number>(3000);
  const isIdle = useIdle(timeoutMs, { throttleMs: THROTTLE_MS });
  const barRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<Animation | null>(null);

  const startSweep = useCallback(() => {
    const bar = barRef.current;
    if (!bar || typeof window === 'undefined') return;

    animRef.current?.cancel();

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      bar.style.transform = 'scale3d(0, 1, 1)';
      return;
    }

    animRef.current = bar.animate(
      [
        { transform: 'scale3d(0, 1, 1)' },
        { transform: 'scale3d(1, 1, 1)' },
      ],
      {
        duration: timeoutMs,
        easing: 'linear',
        fill: 'forwards',
      },
    );
  }, [timeoutMs]);

  const throttledSweep = useThrottleCallback(startSweep, THROTTLE_MS);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    startSweep();

    const listener = () => {
      throttledSweep();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        listener();
      }
    };

    for (const eventName of ACTIVITY_EVENTS) {
      window.addEventListener(eventName, listener, { passive: true });
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      animRef.current?.cancel();
      throttledSweep.cancel();
      for (const eventName of ACTIVITY_EVENTS) {
        window.removeEventListener(eventName, listener);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [startSweep, throttledSweep]);

  useEffect(() => {
    if (isIdle && barRef.current) {
      animRef.current?.cancel();
      barRef.current.style.transform = 'scale3d(1, 1, 1)';
    }
  }, [isIdle]);

  const activeIdx = TIMEOUT_OPTIONS.findIndex((o) => o.value === timeoutMs);

  const triggerWake = () => {
    window.dispatchEvent(new Event('mousemove'));
  };

  const selectTimeout = (value: number) => {
    setTimeoutMs(value);
    window.dispatchEvent(new Event('mousemove'));
  };

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
          style={{
            transform: isIdle
              ? 'scale3d(0.98, 0.98, 1)'
              : 'scale3d(1, 1, 1)',
          }}
          className="relative z-10 flex w-full max-w-xs flex-col items-center gap-3 border border-fd-primary/25 bg-fd-card/85 px-6 py-4 shadow-2xs backdrop-blur-[2px] transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isIdle ? 0.45 : 1 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isIdle ? 0.45 : 1 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isIdle ? 0.45 : 1 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isIdle ? 0.45 : 1 }}
          />

          <div className="flex items-center gap-2">
            <span
              className={`size-2 rounded-full transition-colors duration-150 ease-out ${
                isIdle ? 'bg-fd-muted-foreground/45' : 'bg-fd-primary'
              }`}
            />
            <span className="font-mono text-sm font-semibold tracking-wider text-fd-card-foreground uppercase">
              {isIdle ? 'idle' : 'active'}
            </span>
          </div>

          <div className="h-1 w-full overflow-hidden rounded-full bg-fd-muted">
            <div
              ref={barRef}
              className="h-full w-full origin-left bg-fd-primary"
              style={{
                transform: isIdle ? 'scale3d(1, 1, 1)' : 'scale3d(0, 1, 1)',
              }}
            />
          </div>

          <span className="font-mono text-[10px] text-fd-muted-foreground tabular-nums">
            isIdle: <strong className="text-fd-card-foreground">{String(isIdle)}</strong> · {timeoutMs}ms
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={triggerWake}
            className="rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15 motion-reduce:transition-none"
          >
            Wake
          </button>
          <span className="font-mono text-[11px] text-fd-muted-foreground tabular-nums">
            status: <strong className="text-fd-card-foreground">{isIdle ? 'idle' : 'active'}</strong>
          </span>
        </div>

        <div
          role="group"
          aria-label="Idle timeout"
          className="relative grid grid-cols-3 rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/3)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activeIdx * 100}%, 0, 0)`,
            }}
          />
          {TIMEOUT_OPTIONS.map((option) => {
            const active = timeoutMs === option.value;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => selectTimeout(option.value)}
                className={`relative z-10 rounded-md px-2.5 py-1 font-mono text-[11px] font-medium tabular-nums transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
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
