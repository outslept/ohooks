'use client';

import { useRef, useState } from 'react';
import { useEventListener } from '@/hooks/useEventListener';

const MODE_OPTIONS = [
  { label: 'continuous', once: false },
  { label: 'once: true', once: true },
] as const;

export default function UseEventListenerDemo() {
  const targetRef = useRef<HTMLButtonElement>(null);
  const [once, setOnce] = useState<boolean>(false);
  const [lastEvent, setLastEvent] = useState<{
    type: string;
    detail: string;
  } | null>(null);
  const [count, setCount] = useState<number>(0);

  const pulseTarget = () => {
    if (
      targetRef.current &&
      typeof window !== 'undefined' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      targetRef.current.animate(
        [
          { transform: 'scale3d(0.975, 0.975, 1)' },
          { transform: 'scale3d(1, 1, 1)' },
        ],
        {
          duration: 160,
          easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
        },
      );
    }
  };

  useEventListener(
    'keydown',
    (event) => {
      const keyLabel = event.key === ' ' ? 'Space' : event.key;
      setLastEvent({ type: 'window:keydown', detail: keyLabel });
      setCount((c) => c + 1);
      pulseTarget();
    },
    undefined,
    { once },
  );

  useEventListener(
    'pointerdown',
    (event) => {
      setLastEvent({
        type: 'ref:pointerdown',
        detail: `${Math.round(event.offsetX)}, ${Math.round(event.offsetY)}`,
      });
      setCount((c) => c + 1);
      pulseTarget();
    },
    targetRef,
    { once },
  );

  const dispatchSyntheticKey = () => {
    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
      }),
    );
  };

  const hasCaptured = count > 0;
  const activeModeIdx = once ? 1 : 0;

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

        <button
          ref={targetRef}
          type="button"
          className="relative z-10 flex w-full max-w-sm select-none flex-col items-center gap-2 border border-fd-primary/25 bg-fd-card/85 px-6 py-4 text-center shadow-2xs backdrop-blur-[2px] transition-colors duration-150 ease-out [@media(hover:hover)_and_(pointer:fine)]:hover:border-fd-primary/45 motion-reduce:transition-none"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: hasCaptured ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: hasCaptured ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: hasCaptured ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: hasCaptured ? 1 : 0.45 }}
          />

          <div className="flex items-center gap-1.5">
            <span
              className={`size-2 rounded-full transition-colors duration-150 ease-out ${
                hasCaptured ? 'bg-fd-primary' : 'bg-fd-muted-foreground/40'
              }`}
            />
            <span className="font-mono text-[10px] font-semibold tracking-wider text-fd-muted-foreground uppercase">
              {lastEvent ? lastEvent.type : 'tap box or press any key'}
            </span>
          </div>

          <span className="font-mono text-2xl font-semibold text-fd-card-foreground tabular-nums">
            {lastEvent ? lastEvent.detail : 'idle'}
          </span>

          <span className="font-mono text-[10px] text-fd-muted-foreground tabular-nums">
            captured: <strong className="text-fd-card-foreground">{count}</strong>
            {once && hasCaptured ? ' (once fired)' : ''}
          </span>
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={dispatchSyntheticKey}
            className="rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15 motion-reduce:transition-none"
          >
            Dispatch key
          </button>
          <button
            type="button"
            onClick={() => {
              setCount(0);
              setLastEvent(null);
            }}
            disabled={!hasCaptured}
            className="rounded-lg border bg-fd-muted/40 px-2.5 py-1 text-[11px] font-medium text-fd-card-foreground transition-[background-color,transform,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted/70 motion-reduce:transition-none"
          >
            Clear
          </button>
        </div>

        <div
          role="group"
          aria-label="Event listener options"
          className="relative grid grid-cols-2 rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/2)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activeModeIdx * 100}%, 0, 0)`,
            }}
          />
          {MODE_OPTIONS.map((option) => {
            const active = once === option.once;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => setOnce(option.once)}
                className={`relative z-10 rounded-md px-2.5 py-1 font-mono text-[11px] font-medium transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
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
