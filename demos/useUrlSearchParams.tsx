'use client';

import { useEffect, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useUrlSearchParams } from '@/hooks/useUrlSearchParams';

const TAB_OPTIONS = ['hooks', 'guides', 'api'] as const;
const HISTORY_OPTIONS = ['replace', 'push'] as const;

export default function UseUrlSearchParamsDemo() {
  const [modeIdx, setModeIdx] = useState(0);
  const historyMode = HISTORY_OPTIONS[modeIdx];

  const [params, setParams] = useUrlSearchParams({
    historyMode,
    initialValue: { tab: 'hooks', sort: 'popular' },
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const isFirstRender = useRef(true);
  const queryString = params.toString();

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setIsUpdating(true);
    const id = window.setTimeout(() => setIsUpdating(false), 160);
    return () => window.clearTimeout(id);
  }, [queryString]);

  const currentTab = params.get('tab');
  const currentSort = params.get('sort') ?? 'popular';
  const hasParams = queryString.length > 0;

  const updateParam = (key: string, value: string) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set(key, value);
      return next;
    });
  };

  const toggleSort = () => {
    updateParam('sort', currentSort === 'popular' ? 'recent' : 'popular');
  };

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border bg-fd-card p-4 text-fd-card-foreground shadow-xs">
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

        <div className="relative flex h-24 w-72 max-w-[calc(100%-24px)] items-center justify-center border border-fd-primary/25 bg-fd-card/70 px-4 shadow-2xs backdrop-blur-[2px]">
          <span
            aria-hidden="true"
            className="absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isUpdating ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isUpdating ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isUpdating ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-px -right-px size-2 border-b-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isUpdating ? 1 : 0.45 }}
          />

          <div
            className="flex w-full flex-col items-center gap-1 font-mono tabular-nums transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: isUpdating ? 'scale(1.02)' : 'scale(1)',
            }}
          >
            <div className="max-w-full truncate text-base font-semibold tracking-tight text-fd-card-foreground">
              {hasParams ? `?${queryString}` : '?'}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-fd-muted-foreground">
              <span>{hasParams ? 'location.search' : 'empty query'}</span>
              <span aria-hidden="true" className="text-fd-border">
                ·
              </span>
              <span>{historyMode}State</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex flex-wrap items-center gap-1.5 font-mono tabular-nums">
          {TAB_OPTIONS.map((tab) => {
            const active = currentTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => updateParam('tab', tab)}
                className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-medium transition-[transform,color,background-color] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
                  active
                    ? 'bg-fd-primary/10 font-semibold text-fd-primary'
                    : 'border bg-fd-muted/40 text-fd-card-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted'
                }`}
              >
                tab={tab}
              </button>
            );
          })}

          <button
            type="button"
            onClick={toggleSort}
            className="inline-flex items-center rounded-lg border bg-fd-muted/40 px-2.5 py-1 text-[11px] font-medium text-fd-card-foreground transition-[transform,color,background-color] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted"
          >
            sort={currentSort}
          </button>

          <button
            type="button"
            disabled={!hasParams}
            onClick={() => setParams({})}
            aria-label="Clear query parameters"
            className="inline-flex items-center gap-1 rounded-lg border bg-fd-muted/40 px-2 py-1 text-[11px] font-medium text-fd-card-foreground transition-[transform,opacity,background-color] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted"
          >
            <RotateCcw className="size-3" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-fd-muted-foreground">
            historyMode
          </span>
          <div
            role="group"
            aria-label="History mode"
            className="relative grid grid-cols-2 rounded-lg border bg-fd-muted/50 p-0.5 font-mono text-[11px] tabular-nums"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/2)] rounded-[6px] bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
              style={{
                transform: `translate3d(${modeIdx * 100}%, 0, 0)`,
              }}
            />
            {HISTORY_OPTIONS.map((mode, idx) => {
              const active = idx === modeIdx;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setModeIdx(idx)}
                  className={`relative z-10 rounded-[6px] px-2.5 py-1 text-center font-medium transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
                    active
                      ? 'text-fd-card-foreground'
                      : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-card-foreground'
                  }`}
                >
                  {mode}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
