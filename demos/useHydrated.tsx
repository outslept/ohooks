'use client';

import { useState } from 'react';
import { useHydrated } from '@/hooks/useHydrated';

const SNAPSHOT_OPTIONS = [
  { label: 'client', mode: 'client' },
  { label: 'ssr fallback', mode: 'ssr' },
] as const;

type SnapshotMode = (typeof SNAPSHOT_OPTIONS)[number]['mode'];

export default function UseHydratedDemo() {
  const isHydrated = useHydrated();
  const [mode, setMode] = useState<SnapshotMode>('client');
  const [mountCount, setMountCount] = useState(1);

  const effectiveHydrated = mode === 'ssr' ? false : isHydrated;
  const activeIdx = SNAPSHOT_OPTIONS.findIndex((o) => o.mode === mode);

  const timeZone = effectiveHydrated
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : 'UTC (fallback)';
  const locale = effectiveHydrated ? navigator.language : 'en (fallback)';
  const dpr = effectiveHydrated ? `${window.devicePixelRatio}x` : '1x (fallback)';

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

        <div
          key={mountCount}
          style={{
            transform: effectiveHydrated
              ? 'scale3d(1, 1, 1)'
              : 'scale3d(0.98, 0.98, 1)',
          }}
          className="relative z-10 flex w-full max-w-sm flex-col gap-2 border border-fd-primary/25 bg-fd-card/85 p-3.5 shadow-2xs backdrop-blur-[2px] transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] animate-in fade-in zoom-in-95 motion-reduce:transition-none motion-reduce:animate-none"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: effectiveHydrated ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: effectiveHydrated ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: effectiveHydrated ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: effectiveHydrated ? 1 : 0.45 }}
          />

          <div className="flex items-center justify-between border-b border-fd-border/60 pb-1.5">
            <span className="font-mono text-[10px] font-semibold tracking-wider text-fd-muted-foreground uppercase">
              {effectiveHydrated ? 'getSnapshot()' : 'getServerSnapshot()'}
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold text-fd-card-foreground tabular-nums">
              <span
                className={`size-1.5 rounded-full transition-colors duration-150 ease-out ${
                  effectiveHydrated ? 'bg-fd-primary' : 'bg-fd-muted-foreground/45'
                }`}
              />
              {String(effectiveHydrated)}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-0.5 font-mono text-[11px] tabular-nums">
            <div className="flex flex-col rounded border bg-fd-muted/35 px-2 py-1.5">
              <span className="text-[9px] text-fd-muted-foreground uppercase">
                timeZone
              </span>
              <span className="truncate font-medium text-fd-card-foreground">
                {timeZone}
              </span>
            </div>
            <div className="flex flex-col rounded border bg-fd-muted/35 px-2 py-1.5">
              <span className="text-[9px] text-fd-muted-foreground uppercase">
                locale
              </span>
              <span className="truncate font-medium text-fd-card-foreground">
                {locale}
              </span>
            </div>
            <div className="flex flex-col rounded border bg-fd-muted/35 px-2 py-1.5">
              <span className="text-[9px] text-fd-muted-foreground uppercase">
                dpr
              </span>
              <span className="truncate font-medium text-fd-card-foreground">
                {dpr}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setMode('client');
              setMountCount((c) => c + 1);
            }}
            className="rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15 motion-reduce:transition-none"
          >
            Remount (#{mountCount})
          </button>
          <span className="font-mono text-[11px] text-fd-muted-foreground tabular-nums">
            isHydrated: <strong className="text-fd-card-foreground">{String(isHydrated)}</strong>
          </span>
        </div>

        <div
          role="group"
          aria-label="Hydration snapshot branch"
          className="relative grid grid-cols-2 rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/2)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activeIdx * 100}%, 0, 0)`,
            }}
          />
          {SNAPSHOT_OPTIONS.map((option) => {
            const active = mode === option.mode;
            return (
              <button
                key={option.mode}
                type="button"
                onClick={() => setMode(option.mode)}
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
