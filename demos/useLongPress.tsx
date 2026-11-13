'use client';

import { useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useLongPress } from '@/hooks/useLongPress';

const THRESHOLDS = [400, 700, 1000] as const;
type HoldStatus = 'idle' | 'holding' | 'triggered' | 'canceled';

export default function UseLongPressDemo() {
  const [threshold, setThreshold] =
    useState<(typeof THRESHOLDS)[number]>(700);
  const [status, setStatus] = useState<HoldStatus>('idle');
  const [longPressCount, setLongPressCount] = useState(0);
  const [shortTapCount, setShortTapCount] = useState(0);
  const targetRef = useRef<HTMLButtonElement>(null);

  const handlers = useLongPress<HTMLButtonElement>(
    () => {
      setLongPressCount((count) => count + 1);
      setStatus('triggered');

      if (
        typeof window !== 'undefined' &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        targetRef.current?.animate(
          [
            { transform: 'scale3d(0.95, 0.95, 1)' },
            { transform: 'scale3d(1.02, 1.02, 1)' },
            { transform: 'scale3d(1, 1, 1)' },
          ],
          { duration: 220, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }
        );
      }
    },
    {
      threshold,
      onStart: () => setStatus('holding'),
      onFinish: () => setStatus('triggered'),
      onCancel: () => setStatus('canceled'),
    }
  );

  const resetAll = () => {
    setLongPressCount(0);
    setShortTapCount(0);
    setStatus('idle');
  };

  const activeThresholdIndex = THRESHOLDS.indexOf(threshold);
  const isHolding = status === 'holding';
  const isTriggered = status === 'triggered';

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

        <button
          ref={targetRef}
          type="button"
          {...handlers}
          onClick={() => setShortTapCount((count) => count + 1)}
          style={{ touchAction: 'none' }}
          className={`relative flex w-64 cursor-pointer select-none flex-col items-center justify-center gap-2 border bg-fd-card/70 px-5 py-3.5 shadow-2xs backdrop-blur-[2px] transition-[transform,border-color,background-color] duration-150 ease-out ${
            isHolding
              ? 'scale-[0.97] border-fd-primary/60 bg-fd-card/90'
              : 'border-fd-primary/25 [@media(hover:hover)_and_(pointer:fine)]:hover:border-fd-primary/45'
          }`}
        >
          <span
            className=" -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: isHolding || isTriggered ? 1 : 0.45 }}
          />
          <span
            className=" -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: isHolding || isTriggered ? 1 : 0.45 }}
          />
          <span
            className=" -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: isHolding || isTriggered ? 1 : 0.45 }}
          />
          <span
            className=" -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: isHolding || isTriggered ? 1 : 0.45 }}
          />

          <div className="flex items-center gap-1.5 text-[10px] font-medium tracking-wider text-fd-muted-foreground uppercase">
            <span
              className={`size-1.5 rounded-full transition-colors duration-150 ${
                isTriggered
                  ? 'bg-emerald-500'
                  : isHolding
                    ? 'bg-fd-primary'
                    : status === 'canceled'
                      ? 'bg-amber-500'
                      : 'bg-fd-muted-foreground/50'
              }`}
            />
            <span>
              {isHolding
                ? `Holding (${threshold}ms)`
                : isTriggered
                  ? 'Long press fired'
                  : status === 'canceled'
                    ? 'Canceled early'
                    : 'Press & hold frame'}
            </span>
          </div>

          <div className="flex items-baseline gap-4 font-mono text-xl font-bold tracking-tight text-fd-foreground tabular-nums">
            <span>
              <span className="mr-1.5 text-xs font-normal text-fd-muted-foreground">
                hold
              </span>
              {longPressCount}
            </span>
            <span className="text-fd-border">/</span>
            <span>
              <span className="mr-1.5 text-xs font-normal text-fd-muted-foreground">
                tap
              </span>
              {shortTapCount}
            </span>
          </div>

          <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-fd-muted">
            <div
              className={`h-full w-full origin-left bg-fd-primary motion-reduce:transition-none ${
                isHolding
                  ? 'transition-transform ease-linear'
                  : 'transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]'
              }`}
              style={{
                transform: `scale3d(${isHolding || isTriggered ? 1 : 0}, 1, 1)`,
                transitionDuration: isHolding ? `${threshold}ms` : '150ms',
              }}
            />
          </div>
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <button
          type="button"
          onClick={resetAll}
          className="inline-flex items-center gap-1.5 rounded-lg border bg-fd-muted/40 px-2.5 py-1 text-[11px] font-medium text-fd-card-foreground transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted"
        >
          <RotateCcw className="size-3 text-fd-muted-foreground" />
          Reset
        </button>

        <div
          role="group"
          aria-label="Hold threshold duration"
          className="relative grid grid-cols-3 items-center rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-0.25rem)/3)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activeThresholdIndex * 100}%, 0, 0)`,
            }}
          />
          {THRESHOLDS.map((ms) => {
            const isSelected = threshold === ms;
            return (
              <button
                key={ms}
                type="button"
                onClick={() => {
                  setThreshold(ms);
                  setStatus('idle');
                }}
                className={`relative z-10 px-2 py-0.5 font-mono text-[11px] font-medium tabular-nums transition-[color,transform] duration-150 ease-out active:scale-[0.97] ${
                  isSelected
                    ? 'text-fd-foreground'
                    : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-foreground'
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
