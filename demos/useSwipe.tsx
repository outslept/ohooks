'use client';

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Move,
  RotateCcw,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { type SwipeDirection, useSwipe } from '@/hooks/useSwipe';

const THRESHOLD_OPTIONS = [25, 50, 80] as const;

export default function UseSwipeDemo() {
  const padRef = useRef<HTMLDivElement>(null);
  const [threshold, setThreshold] = useState<number>(50);
  const [lastSwipe, setLastSwipe] = useState<SwipeDirection>('none');
  const [swipeCount, setSwipeCount] = useState(0);

  const { isSwiping, direction, lengthX, lengthY } = useSwipe(padRef, {
    threshold,
    preventDefault: true,
    onSwipeEnd: (state) => {
      if (state.direction !== 'none') {
        setLastSwipe(state.direction);
        setSwipeCount((c) => c + 1);
      }
    },
  });

  const activeDir = isSwiping ? direction : lastSwipe;
  const thresholdMet = isSwiping && direction !== 'none';

  const offsetX = isSwiping
    ? Math.max(-44, Math.min(44, Math.round(-lengthX * 0.45)))
    : 0;
  const offsetY = isSwiping
    ? Math.max(-24, Math.min(24, Math.round(-lengthY * 0.45)))
    : 0;

  const handleReset = () => {
    setLastSwipe('none');
    setSwipeCount(0);
  };

  const thresholdIndex = Math.max(
    0,
    THRESHOLD_OPTIONS.indexOf(threshold as (typeof THRESHOLD_OPTIONS)[number])
  );

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border bg-fd-card p-4 text-fd-card-foreground shadow-xs">
      <div
        ref={padRef}
        className="relative flex h-44 w-full cursor-grab touch-none items-center justify-center overflow-hidden rounded-lg border bg-fd-muted/30 select-none active:cursor-grabbing"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        <div
          className={`relative flex w-60 flex-col gap-2.5 border border-fd-primary/25 bg-fd-card/70 p-3.5 shadow-2xs backdrop-blur-[2px] ${
            isSwiping
              ? 'transition-none'
              : 'transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none'
          }`}
          style={{
            transform: `translate3d(${offsetX}px, ${offsetY}px, 0)`,
          }}
        >
          <span
            className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: thresholdMet ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: thresholdMet ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: thresholdMet ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: thresholdMet ? 1 : 0.45 }}
          />

          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-wider uppercase text-fd-muted-foreground">
              <span
                className={`size-1.5 rounded-full transition-colors duration-150 ease-out ${
                  isSwiping ? 'bg-fd-primary' : 'bg-fd-muted-foreground/40'
                }`}
              />
              {isSwiping ? 'swiping' : 'drag pad'}
            </span>
            <span className="font-mono text-[10px] tabular-nums text-fd-muted-foreground">
              #{swipeCount}
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 border-y border-fd-border/60 py-2.5">
            {activeDir === 'up' && (
              <ArrowUp className="size-4 text-fd-primary" />
            )}
            {activeDir === 'down' && (
              <ArrowDown className="size-4 text-fd-primary" />
            )}
            {activeDir === 'left' && (
              <ArrowLeft className="size-4 text-fd-primary" />
            )}
            {activeDir === 'right' && (
              <ArrowRight className="size-4 text-fd-primary" />
            )}
            {activeDir === 'none' && (
              <Move className="size-4 text-fd-muted-foreground" />
            )}
            <span
              className={`font-mono text-base font-bold tracking-wider uppercase ${
                activeDir !== 'none'
                  ? 'text-fd-primary'
                  : 'text-fd-muted-foreground'
              }`}
            >
              {activeDir}
            </span>
          </div>

          <div className="flex items-center justify-between font-mono text-[11px] tabular-nums text-fd-muted-foreground">
            <span>
              lengthX:{' '}
              <strong className="text-fd-card-foreground">
                {Math.round(lengthX)}px
              </strong>
            </span>
            <span>
              lengthY:{' '}
              <strong className="text-fd-card-foreground">
                {Math.round(lengthY)}px
              </strong>
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleReset}
            disabled={swipeCount === 0 && lastSwipe === 'none'}
            className="inline-flex items-center gap-1.5 rounded-lg border bg-fd-muted/40 px-2.5 py-1 text-[11px] font-medium text-fd-card-foreground transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted"
          >
            <RotateCcw className="size-3" />
            Reset
          </button>
        </div>

        <div
          role="group"
          aria-label="Swipe distance threshold"
          className="relative grid grid-cols-3 rounded-lg border bg-fd-muted/50 p-0.5"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/3)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${thresholdIndex * 100}%, 0, 0)`,
            }}
          />
          {THRESHOLD_OPTIONS.map((px) => {
            const active = threshold === px;
            return (
              <button
                key={px}
                type="button"
                onClick={() => setThreshold(px)}
                className={`relative z-10 rounded-md px-2 py-0.5 font-mono text-[11px] font-medium tabular-nums transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
                  active
                    ? 'text-fd-card-foreground'
                    : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-card-foreground'
                }`}
              >
                {px}px
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
