'use client';

import { useEffect, useRef, useState } from 'react';
import { useDocumentVisibility } from '@/hooks/useDocumentVisibility';

export default function UseDocumentVisibilityDemo() {
  const visibility = useDocumentVisibility();
  const [awayCount, setAwayCount] = useState(0);
  const [lastAwayMs, setLastAwayMs] = useState<number | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const prevVisibilityRef = useRef<DocumentVisibilityState>(visibility);
  const hiddenSinceRef = useRef<number | null>(null);
  const simTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const restoreNativeVisibility = () => {
    if (simTimerRef.current !== null) {
      clearTimeout(simTimerRef.current);
      simTimerRef.current = null;
    }
    if (typeof document !== 'undefined') {
      delete (document as { visibilityState?: DocumentVisibilityState })
        .visibilityState;
      document.dispatchEvent(new Event('visibilitychange'));
    }
    setIsSimulating(false);
  };

  useEffect(() => {
    const prev = prevVisibilityRef.current;
    if (prev === visibility) return;
    prevVisibilityRef.current = visibility;

    if (visibility === 'hidden') {
      hiddenSinceRef.current = performance.now();
      setAwayCount((c) => c + 1);
    } else if (visibility === 'visible' && hiddenSinceRef.current !== null) {
      const elapsed = Math.max(0, performance.now() - hiddenSinceRef.current);
      hiddenSinceRef.current = null;
      setLastAwayMs(Math.round(elapsed));
    }
  }, [visibility]);

  useEffect(() => {
    return () => {
      if (simTimerRef.current !== null) {
        clearTimeout(simTimerRef.current);
      }
      if (typeof document !== 'undefined') {
        delete (document as { visibilityState?: DocumentVisibilityState })
          .visibilityState;
      }
    };
  }, []);

  const triggerSimulatedAway = () => {
    if (typeof document === 'undefined') return;
    if (isSimulating) {
      restoreNativeVisibility();
      return;
    }

    setIsSimulating(true);
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    });
    document.dispatchEvent(new Event('visibilitychange'));

    simTimerRef.current = setTimeout(() => {
      restoreNativeVisibility();
    }, 1200);
  };

  const resetStats = () => {
    setAwayCount(0);
    setLastAwayMs(null);
  };

  const isVisible = visibility === 'visible';

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

        <div
          style={{
            transform: isVisible ? 'scale3d(1, 1, 1)' : 'scale3d(0.97, 0.97, 1)',
          }}
          className={`relative flex w-56 flex-col items-center justify-center gap-2 border bg-fd-card/85 px-4 py-3.5 shadow-2xs backdrop-blur-[2px] transition-[transform,border-color,opacity] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none ${
            isVisible
              ? 'border-fd-primary/30 opacity-100'
              : 'border-fd-border opacity-80'
          }`}
        >
          <span
            className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isVisible ? 1 : 0.35 }}
          />
          <span
            className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isVisible ? 1 : 0.35 }}
          />
          <span
            className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isVisible ? 1 : 0.35 }}
          />
          <span
            className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isVisible ? 1 : 0.35 }}
          />

          <div className="flex items-center gap-2">
            <span
              className={`size-2 rounded-full transition-colors duration-150 ease-out ${
                isVisible ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <span className="font-mono text-base font-semibold tracking-tight text-fd-foreground">
              {visibility}
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px] tabular-nums text-fd-muted-foreground">
            <span>
              away:{' '}
              <strong className="font-semibold text-fd-foreground">
                {awayCount}
              </strong>
            </span>
            <span>·</span>
            <span>
              last:{' '}
              <strong className="font-semibold text-fd-foreground">
                {lastAwayMs !== null ? `${(lastAwayMs / 1000).toFixed(1)}s` : '—'}
              </strong>
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={triggerSimulatedAway}
            className="rounded-lg bg-fd-primary/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-fd-primary transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/20 motion-reduce:transition-none"
          >
            {isSimulating ? 'Restore visible' : 'Simulate away (1.2s)'}
          </button>

          {awayCount > 0 && (
            <button
              type="button"
              onClick={resetStats}
              className="rounded-lg border bg-fd-muted/40 px-2.5 py-1 font-mono text-[11px] font-medium text-fd-muted-foreground transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted/70 [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-foreground motion-reduce:transition-none"
            >
              Reset
            </button>
          )}
        </div>

        <span className="font-mono text-[11px] text-fd-muted-foreground">
          or switch browser tab
        </span>
      </div>
    </div>
  );
}
