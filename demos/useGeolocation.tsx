'use client';

import { useState } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';

const ACCURACY_OPTIONS = [
  { label: 'standard', highAccuracy: false },
  { label: 'highAccuracy', highAccuracy: true },
] as const;

export default function UseGeolocationDemo() {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [enableHighAccuracy, setEnableHighAccuracy] = useState<boolean>(false);

  const {
    isSupported,
    loading,
    latitude,
    longitude,
    accuracy,
    error,
  } = useGeolocation({
    enabled,
    enableHighAccuracy,
  });

  const isWatching = enabled && !loading && !error && latitude !== null;
  const activeAccIdx = enableHighAccuracy ? 1 : 0;

  const statusLabel = !isSupported
    ? 'unsupported'
    : !enabled
      ? 'paused'
      : loading
        ? 'locating...'
        : error
          ? 'error'
          : 'watching';

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
            style={{ opacity: enabled ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: enabled ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: enabled ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: enabled ? 1 : 0.45 }}
          />

          <div className="flex items-center justify-between gap-2 border-b border-fd-border/60 pb-1.5">
            <div className="flex items-center gap-1.5">
              <span
                className={`size-2 rounded-full transition-colors duration-150 ease-out ${
                  error
                    ? 'bg-red-500'
                    : isWatching || loading
                      ? 'bg-fd-primary'
                      : 'bg-fd-muted-foreground/40'
                }`}
              />
              <span className="font-mono text-[10px] font-semibold tracking-wider text-fd-card-foreground uppercase">
                {statusLabel}
              </span>
            </div>

            <span className="truncate font-mono text-[10px] text-fd-muted-foreground tabular-nums">
              {error ? error.message : `supported: ${String(isSupported)}`}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 font-mono text-[11px] tabular-nums">
            <div className="flex flex-col rounded border bg-fd-muted/35 px-2.5 py-1.5">
              <span className="text-[9px] text-fd-muted-foreground uppercase">
                lat
              </span>
              <span className="truncate font-semibold text-fd-card-foreground">
                {latitude !== null ? latitude.toFixed(5) : '—'}
              </span>
            </div>

            <div className="flex flex-col rounded border bg-fd-muted/35 px-2.5 py-1.5">
              <span className="text-[9px] text-fd-muted-foreground uppercase">
                lng
              </span>
              <span className="truncate font-semibold text-fd-card-foreground">
                {longitude !== null ? longitude.toFixed(5) : '—'}
              </span>
            </div>

            <div className="flex flex-col rounded border bg-fd-muted/35 px-2.5 py-1.5">
              <span className="text-[9px] text-fd-muted-foreground uppercase">
                accuracy
              </span>
              <span className="truncate font-semibold text-fd-card-foreground">
                {accuracy !== null ? `±${Math.round(accuracy)}m` : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEnabled((prev) => !prev)}
            disabled={!isSupported}
            className="rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[background-color,transform,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15 motion-reduce:transition-none"
          >
            {enabled ? 'Stop watching' : 'Watch location'}
          </button>
          <span className="font-mono text-[11px] text-fd-muted-foreground tabular-nums">
            enabled: <strong className="text-fd-card-foreground">{String(enabled)}</strong>
          </span>
        </div>

        <div
          role="group"
          aria-label="Geolocation accuracy mode"
          className="relative grid grid-cols-2 rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/2)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activeAccIdx * 100}%, 0, 0)`,
            }}
          />
          {ACCURACY_OPTIONS.map((option) => {
            const active = enableHighAccuracy === option.highAccuracy;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => setEnableHighAccuracy(option.highAccuracy)}
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
