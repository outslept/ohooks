'use client';

import { ArrowRight, RefreshCw, StepForward } from 'lucide-react';
import { useRef, useState } from 'react';
import { usePreviousDistinct } from '@/hooks/usePreviousDistinct';

const STATUSES = ['Idle', 'Queue', 'Run', 'Done'] as const;
type StatusItem = (typeof STATUSES)[number];

export default function UsePreviousDistinctDemo() {
  const [status, setStatus] = useState<StatusItem>('Idle');
  const [sameValueClicks, setSameValueClicks] = useState(0);
  const [renders, setRenders] = useState(1);
  const frameRef = useRef<HTMLDivElement>(null);

  const prevDistinctStatus = usePreviousDistinct(status);

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
        { transform: 'scale3d(1.02, 1.02, 1)' },
        { transform: 'scale3d(1, 1, 1)' },
      ],
      { duration: 200, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }
    );
  };

  const handleSelect = (next: StatusItem) => {
    setRenders((r) => r + 1);
    if (next === status) {
      setSameValueClicks((c) => c + 1);
    } else {
      setSameValueClicks(0);
      setStatus(next);
      pulseFrame();
    }
  };

  const handleCycleNext = () => {
    const currentIndex = STATUSES.indexOf(status);
    const next = STATUSES[(currentIndex + 1) % STATUSES.length];
    handleSelect(next);
  };

  const statusIndex = STATUSES.indexOf(status);

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
          className="relative flex w-80 max-w-[calc(100%-1.5rem)] flex-col gap-2.5 border border-fd-primary/25 bg-fd-card/70 p-3.5 shadow-2xs backdrop-blur-[2px]"
        >
          <span
            className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: prevDistinctStatus !== undefined ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: prevDistinctStatus !== undefined ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: prevDistinctStatus !== undefined ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: prevDistinctStatus !== undefined ? 1 : 0.45 }}
          />

          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-wider uppercase text-fd-muted-foreground">
              <span
                className={`size-1.5 rounded-full transition-colors duration-150 ease-out ${
                  prevDistinctStatus !== undefined
                    ? 'bg-fd-primary'
                    : 'bg-fd-muted-foreground/40'
                }`}
              />
              {sameValueClicks > 0
                ? `ignored ${sameValueClicks}x dup`
                : 'distinct tracker'}
            </span>
            <span className="font-mono text-[10px] tabular-nums text-fd-muted-foreground">
              renders: <strong className="text-fd-card-foreground">{renders}</strong>
            </span>
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-y border-fd-border/60 py-2.5">
            <div className="flex flex-col">
              <span className="text-[10px] font-medium tracking-wider uppercase text-fd-muted-foreground">
                Prev Distinct
              </span>
              <span className="font-mono text-lg font-bold text-fd-card-foreground">
                {prevDistinctStatus ?? 'undefined'}
              </span>
            </div>

            <ArrowRight className="size-3.5 text-fd-muted-foreground" />

            <div className="flex flex-col items-end">
              <span className="text-[10px] font-medium tracking-wider uppercase text-fd-primary">
                Current
              </span>
              <span className="font-mono text-lg font-bold text-fd-primary">
                {status}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between font-mono text-[10px] tabular-nums text-fd-muted-foreground">
            <span>
              Object.is(curr, next) →{' '}
              <strong className="text-fd-card-foreground">
                {sameValueClicks > 0 ? 'true' : 'false'}
              </strong>
            </span>
            <span>{sameValueClicks > 0 ? 'retained' : 'updated'}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCycleNext}
            className="inline-flex items-center gap-1.5 rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15"
          >
            <StepForward className="size-3" />
            Next Distinct
          </button>

          <button
            type="button"
            onClick={() => handleSelect(status)}
            className="inline-flex items-center gap-1 rounded-lg border bg-fd-muted/40 px-2.5 py-1 text-[11px] font-medium text-fd-card-foreground transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted"
          >
            <RefreshCw className="size-3" />
            Same Value
          </button>
        </div>

        <div
          role="group"
          aria-label="Select status"
          className="relative grid grid-cols-4 rounded-lg border bg-fd-muted/50 p-0.5"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/4)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${statusIndex * 100}%, 0, 0)`,
            }}
          />
          {STATUSES.map((item) => {
            const active = status === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => handleSelect(item)}
                className={`relative z-10 rounded-md px-2 py-0.5 font-mono text-[11px] font-medium transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
                  active
                    ? 'text-fd-card-foreground'
                    : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-card-foreground'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
