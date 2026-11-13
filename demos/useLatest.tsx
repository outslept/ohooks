'use client';

import { useEffect, useRef, useState } from 'react';
import { Clock, Plus } from 'lucide-react';
import { useLatest } from '@/hooks/useLatest';

const DELAYS = [
  { ms: 1000, label: '1s' },
  { ms: 2000, label: '2s' },
  { ms: 3000, label: '3s' },
] as const;

type DelayMs = (typeof DELAYS)[number]['ms'];

export default function UseLatestDemo() {
  const [count, setCount] = useState(0);
  const [delayMs, setDelayMs] = useState<DelayMs>(2000);
  const [waiting, setWaiting] = useState(false);
  const [result, setResult] = useState<{
    stale: number;
    latest: number;
  } | null>(null);

  const latestCountRef = useLatest(count);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const clearPendingTimer = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const scheduleDelayedRead = () => {
    clearPendingTimer();
    const closureSnapshot = count;
    setWaiting(true);

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setResult({
        stale: closureSnapshot,
        latest: latestCountRef.current,
      });
      setWaiting(false);

      if (
        typeof window !== 'undefined' &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        frameRef.current?.animate(
          [
            { transform: 'scale3d(0.97, 0.97, 1)', opacity: 0.75 },
            { transform: 'scale3d(1, 1, 1)', opacity: 1 },
          ],
          { duration: 200, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }
        );
      }
    }, delayMs);
  };

  const activeDelayIndex = DELAYS.findIndex((item) => item.ms === delayMs);

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
          className="relative flex w-68 flex-col items-center justify-center gap-2 border border-fd-primary/25 bg-fd-card/70 px-5 py-3.5 shadow-2xs backdrop-blur-[2px]"
        >
          <span
            className=" -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: waiting ? 1 : 0.45 }}
          />
          <span
            className=" -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: waiting ? 1 : 0.45 }}
          />
          <span
            className=" -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: waiting ? 1 : 0.45 }}
          />
          <span
            className=" -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: waiting ? 1 : 0.45 }}
          />

          <div className="flex items-center gap-1.5 text-[10px] font-medium tracking-wider text-fd-muted-foreground uppercase">
            <span
              className={`size-1.5 rounded-full transition-colors duration-150 ${
                waiting ? 'bg-fd-primary' : 'bg-emerald-500'
              }`}
            />
            <span>
              {waiting ? `Reading in ${delayMs}ms…` : 'latestRef.current'}
            </span>
          </div>

          <div className="grid w-full grid-cols-3 gap-2 py-0.5 text-center font-mono tabular-nums">
            <div className="flex flex-col">
              <span className="text-[10px] text-fd-muted-foreground">live</span>
              <span className="text-lg font-bold text-fd-foreground">
                {count}
              </span>
            </div>
            <div className="flex flex-col border-x border-fd-border/60">
              <span className="text-[10px] text-fd-muted-foreground">
                closure
              </span>
              <span className="text-lg font-bold text-fd-muted-foreground">
                {result !== null ? result.stale : '—'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-fd-primary">latestRef</span>
              <span className="text-lg font-bold text-fd-primary">
                {result !== null ? result.latest : '—'}
              </span>
            </div>
          </div>

          <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-fd-muted">
            <div
              className={`h-full w-full origin-left bg-fd-primary motion-reduce:transition-none ${
                waiting
                  ? 'transition-transform ease-linear'
                  : 'transition-none'
              }`}
              style={{
                transform: `scale3d(${waiting ? 1 : 0}, 1, 1)`,
                transitionDuration: waiting ? `${delayMs}ms` : '0ms',
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCount((c) => c + 1)}
            className="inline-flex items-center gap-1 rounded-lg bg-fd-primary/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-fd-primary tabular-nums transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15"
          >
            <Plus className="size-3.5" />1 ({count})
          </button>
          <button
            type="button"
            onClick={scheduleDelayedRead}
            disabled={waiting}
            className="inline-flex items-center gap-1.5 rounded-lg border bg-fd-muted/40 px-2.5 py-1 text-[11px] font-medium text-fd-card-foreground transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted"
          >
            <Clock className="size-3 text-fd-muted-foreground" />
            {waiting ? 'Pending…' : 'Schedule read'}
          </button>
        </div>

        <div
          role="group"
          aria-label="Read delay duration"
          className="relative grid grid-cols-3 items-center rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-0.25rem)/3)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activeDelayIndex * 100}%, 0, 0)`,
            }}
          />
          {DELAYS.map((item) => {
            const isSelected = delayMs === item.ms;
            return (
              <button
                key={item.ms}
                type="button"
                disabled={waiting}
                onClick={() => setDelayMs(item.ms)}
                className={`relative z-10 px-2 py-0.5 font-mono text-[11px] font-medium tabular-nums transition-[color,transform,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 ${
                  isSelected
                    ? 'text-fd-foreground'
                    : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-foreground'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
