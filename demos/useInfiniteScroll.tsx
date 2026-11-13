'use client';

import { Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

const PAGE_SIZE = 6;
const MAX_ITEMS = 24;

const MODE_OPTIONS = [
  { label: 'auto', enabled: true },
  { label: 'manual', enabled: false },
] as const;

function createPage(start: number, count: number): number[] {
  return Array.from({ length: count }, (_, i) => start + i + 1);
}

export default function UseInfiniteScrollDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<number[]>(() => createPage(0, PAGE_SIZE));
  const [autoEnabled, setAutoEnabled] = useState<boolean>(true);

  const hasMore = items.length < MAX_ITEMS;

  const appendNextPage = async () => {
    await new Promise((resolve) => setTimeout(resolve, 450));
    setItems((prev) =>
      prev.length >= MAX_ITEMS
        ? prev
        : [...prev, ...createPage(prev.length, PAGE_SIZE)],
    );
  };

  const { isLoading, loadMore } = useInfiniteScroll(
    sentinelRef,
    appendNextPage,
    {
      root: rootRef,
      rootMargin: '0px 0px 24px 0px',
      hasMore,
      enabled: autoEnabled,
    },
  );

  const handleManualLoad = () => {
    if (isLoading || !hasMore) return;
    if (autoEnabled) {
      void loadMore();
    } else {
      void appendNextPage();
    }
  };

  const handleReset = () => {
    setItems(createPage(0, PAGE_SIZE));
    rootRef.current?.scrollTo({ top: 0 });
  };

  const activeModeIdx = autoEnabled ? 0 : 1;

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border bg-fd-card p-4 text-fd-card-foreground shadow-xs">
      <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-lg border bg-fd-muted/30 p-3">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        <div className="relative z-10 flex h-full w-full max-w-md flex-col border border-fd-primary/25 bg-fd-card/85 shadow-2xs backdrop-blur-[2px]">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-px -left-px z-20 size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isLoading ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-px -right-px z-20 size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isLoading ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-px -left-px z-20 size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isLoading ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-px -bottom-px z-20 size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isLoading ? 1 : 0.45 }}
          />

          <div
            ref={rootRef}
            className="flex-1 space-y-1.5 overflow-y-auto p-2.5 text-xs"
          >
            {items.map((num) => (
              <div
                key={num}
                className="flex items-center justify-between rounded-md border bg-fd-muted/35 px-3 py-1.5 font-mono text-[11px] tabular-nums animate-in fade-in zoom-in-95 duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:animate-none"
              >
                <span className="font-medium text-fd-card-foreground">
                  Item #{String(num).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-fd-muted-foreground">
                  batch {Math.ceil(num / PAGE_SIZE)}
                </span>
              </div>
            ))}

            <div
              ref={sentinelRef}
              className="flex h-7 items-center justify-center font-mono text-[11px] text-fd-muted-foreground tabular-nums"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-1.5 text-fd-primary">
                  <Loader2 className="size-3.5 animate-spin motion-reduce:animate-none" />
                  loading...
                </span>
              ) : hasMore ? (
                <span>{autoEnabled ? '↓ sentinel' : 'auto paused'}</span>
              ) : (
                <span>end of list ({MAX_ITEMS})</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleManualLoad}
            disabled={!hasMore || isLoading}
            className="rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[background-color,transform,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15 motion-reduce:transition-none"
          >
            loadMore()
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={items.length === PAGE_SIZE && !isLoading}
            className="rounded-lg border bg-fd-muted/40 px-2.5 py-1 text-[11px] font-medium text-fd-card-foreground transition-[background-color,transform,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted/70 motion-reduce:transition-none"
          >
            Reset
          </button>
          <span className="ml-1 font-mono text-[11px] text-fd-muted-foreground tabular-nums">
            <strong className="text-fd-card-foreground">{items.length}</strong> / {MAX_ITEMS}
          </span>
        </div>

        <div
          role="group"
          aria-label="Infinite scroll observer mode"
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
            const active = autoEnabled === option.enabled;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => setAutoEnabled(option.enabled)}
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
