'use client';

import { useEffect, useState } from 'react';
import { RotateCcw, Square } from 'lucide-react';
import { useTimeout } from '@/hooks/useTimeout';

const DELAY_OPTIONS = [
  { label: '1000ms', value: 1000 },
  { label: '2000ms', value: 2000 },
  { label: 'null', value: null },
] as const;

function TimeoutProbe({
  delay,
  onFire,
}: {
  delay: number | null;
  onFire: () => void;
}) {
  useTimeout(onFire, delay);
  return null;
}

export default function UseTimeoutDemo() {
  const [delayIdx, setDelayIdx] = useState<number>(1);
  const [lastTimedIdx, setLastTimedIdx] = useState<number>(1);
  const [runId, setRunId] = useState(0);
  const [firedCount, setFiredCount] = useState(0);
  const [isFired, setIsFired] = useState(false);
  const [fillBar, setFillBar] = useState(false);

  const delay = DELAY_OPTIONS[delayIdx].value;
  const isPending = delay !== null && !isFired;

  useEffect(() => {
    if (!isPending) {
      setFillBar(false);
      return;
    }
    setFillBar(false);
    const frame = requestAnimationFrame(() => {
      setFillBar(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [isPending, runId, delay]);

  const handleSelectDelay = (idx: number) => {
    setDelayIdx(idx);
    if (DELAY_OPTIONS[idx].value !== null) {
      setLastTimedIdx(idx);
      setIsFired(false);
      setRunId((id) => id + 1);
    }
  };

  const handleRestart = () => {
    if (delay === null) {
      setDelayIdx(lastTimedIdx);
    }
    setIsFired(false);
    setRunId((id) => id + 1);
  };

  const handleCancel = () => {
    setDelayIdx(2);
    setIsFired(false);
  };

  const handleFire = () => {
    setIsFired(true);
    setFiredCount((c) => c + 1);
  };

  const statusKey =
    delay === null ? 'cancelled' : isFired ? 'fired' : 'pending';

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border bg-fd-card p-4 text-fd-card-foreground shadow-xs">
      <TimeoutProbe
        key={runId}
        delay={isPending ? delay : null}
        onFire={handleFire}
      />

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

        <div className="relative flex h-24 w-60 items-center justify-center border border-fd-primary/25 bg-fd-card/70 shadow-2xs backdrop-blur-[2px]">
          <span
            aria-hidden="true"
            className="absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isPending ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isPending ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isPending ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-px -right-px size-2 border-b-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isPending ? 1 : 0.45 }}
          />

          {isPending && delay !== null && (
            <span
              key={`${runId}-${delay}`}
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left bg-fd-primary transition-transform ease-linear motion-reduce:transition-none"
              style={{
                transitionDuration: `${delay}ms`,
                transform: fillBar ? 'scaleX(1)' : 'scaleX(0)',
              }}
            />
          )}

          <div
            key={`${statusKey}-${runId}`}
            className="animate-in fade-in zoom-in-95 flex flex-col items-center gap-1 px-3 font-mono tabular-nums duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:animate-none"
          >
            {statusKey === 'pending' && (
              <>
                <span className="text-lg font-semibold tracking-tight text-fd-card-foreground">
                  pending
                </span>
                <span className="text-[11px] text-fd-muted-foreground">
                  delay: {delay}ms
                </span>
              </>
            )}

            {statusKey === 'fired' && (
              <>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-semibold tracking-tight text-fd-card-foreground">
                    fired
                  </span>
                  <span className="rounded bg-fd-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-fd-primary">
                    #{firedCount}
                  </span>
                </div>
                <span className="text-[11px] text-fd-muted-foreground">
                  after {delay}ms
                </span>
              </>
            )}

            {statusKey === 'cancelled' && (
              <>
                <span className="text-lg font-semibold tracking-tight text-fd-card-foreground">
                  paused
                </span>
                <span className="text-[11px] text-fd-muted-foreground">
                  delay: null
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1.5 font-mono tabular-nums">
          <button
            type="button"
            onClick={handleRestart}
            className="inline-flex items-center gap-1.5 rounded-lg bg-fd-primary/10 px-3 py-1 text-[11px] font-semibold text-fd-primary transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15"
          >
            <RotateCcw className="size-3" />
            Restart
          </button>
          <button
            type="button"
            disabled={!isPending}
            onClick={handleCancel}
            className="inline-flex items-center gap-1 rounded-lg border bg-fd-muted/40 px-2.5 py-1 text-[11px] font-medium text-fd-card-foreground transition-[transform,opacity,background-color] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted"
          >
            <Square className="size-3" />
            Cancel
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-fd-muted-foreground">
            delay
          </span>
          <div
            role="group"
            aria-label="Timeout delay"
            className="relative grid grid-cols-3 rounded-lg border bg-fd-muted/50 p-0.5 font-mono text-[11px] tabular-nums"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/3)] rounded-[6px] bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
              style={{
                transform: `translate3d(${delayIdx * 100}%, 0, 0)`,
              }}
            />
            {DELAY_OPTIONS.map((opt, idx) => {
              const active = idx === delayIdx;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => handleSelectDelay(idx)}
                  className={`relative z-10 rounded-[6px] px-2 py-1 text-center font-medium transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
                    active
                      ? 'text-fd-card-foreground'
                      : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-card-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
