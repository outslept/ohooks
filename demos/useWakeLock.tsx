'use client';

import { useState } from 'react';
import { Lock, Sun, Unlock } from 'lucide-react';
import { useWakeLock } from '@/hooks/useWakeLock';

const REACQUIRE_OPTIONS = [
  { label: 'true', value: true },
  { label: 'false', value: false },
] as const;

export default function UseWakeLockDemo() {
  const [enabled, setEnabled] = useState(false);
  const [reacquireIdx, setReacquireIdx] = useState(0);
  const reacquireOnVisible = REACQUIRE_OPTIONS[reacquireIdx].value;

  const { isSupported, isLocked, error } = useWakeLock(enabled, {
    reacquireOnVisible,
  });

  const statusKey = error
    ? 'error'
    : !isSupported
      ? 'unsupported'
      : isLocked
        ? 'locked'
        : 'released';

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

        <div
          aria-hidden="true"
          className="pointer-events-none absolute size-40 rounded-full bg-fd-primary/10 blur-2xl transition-opacity duration-200 ease-out motion-reduce:transition-none"
          style={{ opacity: isLocked ? 1 : 0 }}
        />

        <div
          className="relative flex h-24 w-60 items-center justify-center border border-fd-primary/25 bg-fd-card/70 shadow-2xs backdrop-blur-[2px] transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
          style={{
            transform: isLocked ? 'scale(1)' : 'scale(0.98)',
          }}
        >
          <span
            aria-hidden="true"
            className="absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isLocked ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isLocked ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isLocked ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-px -right-px size-2 border-b-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isLocked ? 1 : 0.45 }}
          />

          <div
            key={statusKey}
            className="animate-in fade-in zoom-in-95 flex flex-col items-center gap-1 px-3 font-mono tabular-nums duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:animate-none"
          >
            {statusKey === 'locked' && (
              <>
                <div className="flex items-center gap-1.5 text-lg font-semibold tracking-tight text-fd-card-foreground">
                  <Sun className="size-4 text-fd-primary" />
                  <span>locked</span>
                </div>
                <span className="text-[11px] text-fd-muted-foreground">
                  screen: awake
                </span>
              </>
            )}

            {statusKey === 'released' && (
              <>
                <span className="text-lg font-semibold tracking-tight text-fd-card-foreground">
                  released
                </span>
                <span className="text-[11px] text-fd-muted-foreground">
                  screen: normal sleep
                </span>
              </>
            )}

            {statusKey === 'unsupported' && (
              <>
                <span className="text-lg font-semibold tracking-tight text-fd-muted-foreground">
                  unsupported
                </span>
                <span className="text-[11px] text-fd-muted-foreground">
                  navigator.wakeLock unavailable
                </span>
              </>
            )}

            {statusKey === 'error' && error && (
              <>
                <span className="text-lg font-semibold tracking-tight text-red-500">
                  error
                </span>
                <span className="max-w-[210px] truncate text-[11px] text-fd-muted-foreground">
                  {error.message}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-2 font-mono tabular-nums">
          <button
            type="button"
            disabled={!isSupported}
            onClick={() => setEnabled((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-[11px] font-semibold transition-[transform,opacity,background-color,color] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none ${
              enabled
                ? 'border bg-fd-muted/40 text-fd-card-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted'
                : 'bg-fd-primary/10 text-fd-primary [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15'
            }`}
          >
            {enabled ? (
              <>
                <Unlock className="size-3" />
                Release
              </>
            ) : (
              <>
                <Lock className="size-3" />
                Acquire
              </>
            )}
          </button>

          <span className="text-[11px] text-fd-muted-foreground">
            {isSupported ? 'supported' : 'unsupported'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-fd-muted-foreground">
            reacquireOnVisible
          </span>
          <div
            role="group"
            aria-label="Reacquire wake lock on visibility change"
            className="relative grid grid-cols-2 rounded-lg border bg-fd-muted/50 p-0.5 font-mono text-[11px] tabular-nums"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/2)] rounded-[6px] bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
              style={{
                transform: `translate3d(${reacquireIdx * 100}%, 0, 0)`,
              }}
            />
            {REACQUIRE_OPTIONS.map((opt, idx) => {
              const active = idx === reacquireIdx;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setReacquireIdx(idx)}
                  className={`relative z-10 rounded-[6px] px-2.5 py-1 text-center font-medium transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
                    active
                      ? 'text-fd-card-foreground'
                      : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-card-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
