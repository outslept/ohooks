'use client';

import { useState } from 'react';
import { useHash } from '@/hooks/useHash';

const TABS = ['overview', 'metrics', 'settings'] as const;

const HISTORY_OPTIONS = [
  { label: 'replace', replace: true },
  { label: 'push', replace: false },
] as const;

export default function UseHashDemo() {
  const [hash, setHash] = useHash();
  const [replace, setReplace] = useState<boolean>(true);

  const hasHash = Boolean(hash);
  const activeHistoryIdx = replace ? 0 : 1;

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

        <div className="relative z-10 flex w-full max-w-md flex-col gap-2.5 border border-fd-primary/25 bg-fd-card/85 p-3.5 shadow-2xs backdrop-blur-[2px]">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: hasHash ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: hasHash ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: hasHash ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: hasHash ? 1 : 0.45 }}
          />

          <div className="flex items-center justify-between gap-2 rounded-md border bg-fd-muted/35 px-2.5 py-1.5 font-mono text-[11px] tabular-nums">
            <span className="truncate text-fd-muted-foreground">
              window.location.hash
            </span>
            <span className="shrink-0 font-semibold text-fd-card-foreground">
              {hasHash ? `#${hash}` : '(empty)'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {TABS.map((tab) => {
              const active = hash === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setHash(tab, { replace })}
                  className={`rounded-md border px-2.5 py-2 font-mono text-[11px] font-medium transition-[transform,border-color,background-color,color] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
                    active
                      ? 'border-fd-primary/60 bg-fd-primary/10 text-fd-primary'
                      : 'border-fd-border bg-fd-muted/40 text-fd-card-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted/70'
                  }`}
                >
                  #{tab}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setHash('', { replace })}
            disabled={!hasHash}
            className="rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[background-color,transform,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15 motion-reduce:transition-none"
          >
            Clear
          </button>
          <span className="font-mono text-[11px] text-fd-muted-foreground tabular-nums">
            value: <strong className="text-fd-card-foreground">&quot;{hash}&quot;</strong>
          </span>
        </div>

        <div
          role="group"
          aria-label="Hash history update mode"
          className="relative grid grid-cols-2 rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/2)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activeHistoryIdx * 100}%, 0, 0)`,
            }}
          />
          {HISTORY_OPTIONS.map((option) => {
            const active = replace === option.replace;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => setReplace(option.replace)}
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
