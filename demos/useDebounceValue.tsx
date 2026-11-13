'use client';

import { useEffect, useRef, useState } from 'react';
import {useDebounceValue} from '@/hooks/useDebounceValue';

const DELAY_OPTIONS = [
  { value: 500, label: '500ms' },
  { value: 1200, label: '1200ms' },
] as const;

export default function UseDebounceValueDemo() {
  const [query, setQuery] = useState('react hooks');
  const [delay, setDelay] = useState<number>(500);
  const [isCancelled, setIsCancelled] = useState(false);

  const [debouncedQuery, controls] = useDebounceValue(query, delay);
  const barRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<Animation | null>(null);

  const isPending = !isCancelled && query !== debouncedQuery;

  useEffect(() => {
    const el = barRef.current;
    animRef.current?.cancel();

    if (!el || !isPending) {
      return;
    }

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      return;
    }

    animRef.current = el.animate(
      [
        { transform: 'scale3d(0, 1, 1)' },
        { transform: 'scale3d(1, 1, 1)' },
      ],
      {
        duration: delay,
        easing: 'linear',
      },
    );

    return () => {
      animRef.current?.cancel();
    };
  }, [query, delay, isPending]);

  const handleFlush = () => {
    controls.flush();
    setIsCancelled(false);
  };

  const handleCancel = () => {
    controls.cancel();
    setIsCancelled(true);
  };

  const activeDelayIdx = DELAY_OPTIONS.findIndex((o) => o.value === delay);

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border bg-fd-card p-4 text-fd-card-foreground shadow-xs">
      <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-lg border bg-fd-muted/30 px-3">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        <div className="relative flex w-full max-w-xs flex-col gap-2.5 border border-fd-primary/25 bg-fd-card/85 p-3.5 shadow-2xs backdrop-blur-[2px]">
          <span
            className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isPending ? 1 : 0.4 }}
          />
          <span
            className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isPending ? 1 : 0.4 }}
          />
          <span
            className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isPending ? 1 : 0.4 }}
          />
          <span
            className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isPending ? 1 : 0.4 }}
          />

          <input
            type="text"
            value={query}
            onChange={(e) => {
              setIsCancelled(false);
              setQuery(e.target.value);
            }}
            placeholder="Type to debounce..."
            aria-label="Debounced input"
            className="w-full rounded-md border bg-fd-background/80 px-2.5 py-1.5 font-mono text-xs text-fd-foreground placeholder:text-fd-muted-foreground/60 focus:border-fd-primary focus:outline-none"
          />

          <div className="flex items-center justify-between gap-2 font-mono text-xs">
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="shrink-0 text-[10px] uppercase text-fd-muted-foreground">
                out:
              </span>
              <span className="truncate font-semibold text-fd-foreground">
                {debouncedQuery || '—'}
              </span>
            </div>

            <span
              className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase transition-colors duration-150 ease-out ${
                isPending
                  ? 'bg-fd-primary/15 text-fd-primary'
                  : isCancelled && query !== debouncedQuery
                    ? 'bg-amber-500/15 text-amber-500'
                    : 'bg-fd-muted text-fd-muted-foreground'
              }`}
            >
              {isPending
                ? 'Pending'
                : isCancelled && query !== debouncedQuery
                  ? 'Cancelled'
                  : 'Synced'}
            </span>
          </div>

          <div className="h-1 w-full overflow-hidden rounded-full bg-fd-muted">
            <div
              ref={barRef}
              className="h-full w-full origin-left bg-fd-primary"
              style={{
                transform: isPending ? 'scale3d(1, 1, 1)' : 'scale3d(0, 1, 1)',
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleFlush}
            disabled={!isPending}
            className="rounded-lg bg-fd-primary/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-fd-primary transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/20 motion-reduce:transition-none"
          >
            Flush
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={!isPending}
            className="rounded-lg border bg-fd-muted/40 px-2.5 py-1 font-mono text-[11px] font-medium text-fd-card-foreground transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted/70 motion-reduce:transition-none"
          >
            Cancel
          </button>
        </div>

        <div
          role="group"
          aria-label="Debounce delay"
          className="relative grid grid-cols-2 rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/2)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activeDelayIdx * 100}%, 0, 0)`,
            }}
          />
          {DELAY_OPTIONS.map((option) => {
            const active = delay === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setIsCancelled(false);
                  setDelay(option.value);
                }}
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
