'use client';

import { useEffect, useRef, useState } from 'react';
import { useDebounceCallback } from '@/hooks/useDebounceCallback';

type EdgeMode = 'trailing' | 'leading';

const EDGE_MODES: { value: EdgeMode; label: string }[] = [
  { value: 'trailing', label: 'trailing' },
  { value: 'leading', label: 'leading' },
];

const DELAY_MS = 700;

export default function UseDebounceCallbackDemo() {
  const [edgeMode, setEdgeMode] = useState<EdgeMode>('trailing');
  const [rawCount, setRawCount] = useState(0);
  const [invokedCount, setInvokedCount] = useState(0);
  const [lastArg, setLastArg] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);

  const barRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<Animation | null>(null);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSyncTimer = () => {
    if (syncTimerRef.current !== null) {
      clearTimeout(syncTimerRef.current);
      syncTimerRef.current = null;
    }
  };

  const debouncedTrigger = useDebounceCallback(
    (callNumber: number) => {
      setInvokedCount((c) => c + 1);
      setLastArg(callNumber);
      setPending(false);
      clearSyncTimer();
    },
    DELAY_MS,
    {
      leading: edgeMode === 'leading',
      trailing: edgeMode === 'trailing',
    },
  );

  useEffect(() => {
    const el = barRef.current;
    animRef.current?.cancel();

    if (!el || !pending) {
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
        duration: DELAY_MS,
        easing: 'linear',
      },
    );

    return () => {
      animRef.current?.cancel();
    };
  }, [pending, pulseKey]);

  useEffect(() => {
    return () => clearSyncTimer();
  }, []);

  const handleTrigger = () => {
    const next = rawCount + 1;
    setRawCount(next);
    debouncedTrigger(next);
    setPending(debouncedTrigger.isPending());
    setPulseKey((k) => k + 1);

    clearSyncTimer();
    syncTimerRef.current = setTimeout(() => {
      setPending(debouncedTrigger.isPending());
    }, DELAY_MS + 16);
  };

  const handleFlush = () => {
    debouncedTrigger.flush();
    setPending(debouncedTrigger.isPending());
    clearSyncTimer();
  };

  const handleCancel = () => {
    debouncedTrigger.cancel();
    setPending(false);
    clearSyncTimer();
  };

  const activeEdgeIdx = EDGE_MODES.findIndex((m) => m.value === edgeMode);

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border bg-fd-card p-4 text-fd-card-foreground shadow-xs">
      <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-lg border bg-fd-muted/30">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        <div className="relative flex w-60 flex-col gap-2.5 border border-fd-primary/25 bg-fd-card/85 px-4 py-3 shadow-2xs backdrop-blur-[2px]">
          <span
            className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: pending ? 1 : 0.4 }}
          />
          <span
            className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: pending ? 1 : 0.4 }}
          />
          <span
            className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: pending ? 1 : 0.4 }}
          />
          <span
            className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: pending ? 1 : 0.4 }}
          />

          <div className="flex items-center justify-between font-mono tabular-nums">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-fd-muted-foreground">
                calls
              </span>
              <span className="text-lg font-semibold tracking-tight text-fd-foreground">
                {rawCount}
              </span>
            </div>

            <span className="text-xs text-fd-muted-foreground">→</span>

            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase text-fd-muted-foreground">
                invoked
              </span>
              <span className="text-lg font-semibold tracking-tight text-fd-primary">
                {invokedCount}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between font-mono text-[11px] tabular-nums">
            <span className="text-fd-muted-foreground">
              arg:{' '}
              <strong className="font-semibold text-fd-foreground">
                {lastArg !== null ? `#${lastArg}` : '—'}
              </strong>
            </span>

            <span
              className={`rounded px-1.5 py-0.2 text-[10px] font-semibold tracking-wider uppercase transition-colors duration-150 ease-out ${
                pending
                  ? 'bg-fd-primary/15 text-fd-primary'
                  : 'bg-fd-muted text-fd-muted-foreground'
              }`}
            >
              {pending ? 'Pending' : 'Idle'}
            </span>
          </div>

          <div className="h-1 w-full overflow-hidden rounded-full bg-fd-muted">
            <div
              ref={barRef}
              className="h-full w-full origin-left bg-fd-primary"
              style={{
                transform: pending ? 'scale3d(1, 1, 1)' : 'scale3d(0, 1, 1)',
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleTrigger}
            className="rounded-lg bg-fd-primary/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-fd-primary transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/20 motion-reduce:transition-none"
          >
            Trigger (+1)
          </button>
          <button
            type="button"
            onClick={handleFlush}
            disabled={!pending || edgeMode === 'leading'}
            className="rounded-lg border bg-fd-muted/40 px-2.5 py-1 font-mono text-[11px] font-medium text-fd-card-foreground transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted/70 motion-reduce:transition-none"
          >
            Flush
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={!pending}
            className="rounded-lg border bg-fd-muted/40 px-2.5 py-1 font-mono text-[11px] font-medium text-fd-card-foreground transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted/70 motion-reduce:transition-none"
          >
            Cancel
          </button>
        </div>

        <div
          role="group"
          aria-label="Debounce edge mode"
          className="relative grid grid-cols-2 rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/2)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activeEdgeIdx * 100}%, 0, 0)`,
            }}
          />
          {EDGE_MODES.map((mode) => {
            const active = edgeMode === mode.value;
            return (
              <button
                key={mode.value}
                type="button"
                onClick={() => {
                  debouncedTrigger.cancel();
                  setPending(false);
                  clearSyncTimer();
                  setEdgeMode(mode.value);
                }}
                className={`relative z-10 rounded-md px-2 py-0.5 font-mono text-[11px] font-medium transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
                  active
                    ? 'text-fd-foreground'
                    : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-foreground'
                }`}
              >
                {mode.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
