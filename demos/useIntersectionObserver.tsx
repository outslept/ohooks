'use client';

import { useRef, useState } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const THRESHOLDS = Array.from({ length: 21 }, (_, i) => Number((i / 20).toFixed(2)));

const MODE_OPTIONS = [
  { label: 'live', freeze: false },
  { label: 'freezeOnceVisible', freeze: true },
] as const;

export default function UseIntersectionObserverDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const [freezeOnceVisible, setFreezeOnceVisible] = useState(false);

  const entry = useIntersectionObserver(targetRef, {
    root: rootRef,
    threshold: THRESHOLDS,
    freezeOnceVisible,
  });

  const isVisible = Boolean(entry?.isIntersecting);
  const ratio = entry?.intersectionRatio ?? 0;
  const percent = Math.round(ratio * 100);
  const isFrozen = isVisible && freezeOnceVisible;
  const activeModeIdx = freezeOnceVisible ? 1 : 0;

  const toggleScrollPosition = () => {
    const root = rootRef.current;
    const target = targetRef.current;
    if (!root || !target) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const behavior: ScrollBehavior = prefersReduced ? 'auto' : 'smooth';

    if (isVisible && !isFrozen) {
      root.scrollTo({ top: 0, behavior });
    } else {
      const targetCenter =
        target.offsetTop - root.clientHeight / 2 + target.clientHeight / 2;
      root.scrollTo({
        top: root.scrollTop > 40 ? 0 : Math.max(0, targetCenter),
        behavior,
      });
    }
  };

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border bg-fd-card p-4 text-fd-card-foreground shadow-xs">
      <div
        ref={rootRef}
        className="relative h-44 w-full overflow-y-auto rounded-lg border bg-fd-muted/30 px-4"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none sticky top-0 left-0 -mb-44 h-44 w-full opacity-35"
          style={{
            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        <div className="relative z-10 flex h-36 items-center justify-center">
          <span className="font-mono text-[11px] text-fd-muted-foreground tabular-nums">
            ↓ scroll viewport ({percent}%)
          </span>
        </div>

        <div className="relative z-10 flex justify-center py-2">
          <div
            ref={targetRef}
            className={`relative flex w-full max-w-xs flex-col items-center gap-2 border px-5 py-4 shadow-2xs backdrop-blur-[2px] transition-[border-color,background-color] duration-150 ease-out motion-reduce:transition-none ${
              isVisible
                ? 'border-fd-primary/50 bg-fd-card/90'
                : 'border-fd-primary/20 bg-fd-card/65'
            }`}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
              style={{ opacity: isVisible ? 1 : 0.4 }}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
              style={{ opacity: isVisible ? 1 : 0.4 }}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
              style={{ opacity: isVisible ? 1 : 0.4 }}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
              style={{ opacity: isVisible ? 1 : 0.4 }}
            />

            <div className="flex w-full items-center justify-between gap-3">
              <span className="font-mono text-[11px] font-semibold tracking-wider text-fd-muted-foreground uppercase">
                {isFrozen ? 'frozen' : isVisible ? 'intersecting' : 'outside'}
              </span>
              <span className="font-mono text-sm font-semibold text-fd-card-foreground tabular-nums">
                {percent}%
              </span>
            </div>

            <div className="h-1 w-full overflow-hidden rounded-full bg-fd-muted">
              <div
                className="h-full w-full origin-left bg-fd-primary"
                style={{
                  transform: `scale3d(${ratio}, 1, 1)`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="h-36" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleScrollPosition}
            className="rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15 motion-reduce:transition-none"
          >
            {isVisible && !isFrozen ? 'Scroll top' : 'Toggle scroll'}
          </button>
          <span className="font-mono text-[11px] text-fd-muted-foreground tabular-nums">
            visible: <strong className="text-fd-card-foreground">{String(isVisible)}</strong> · {percent}%
          </span>
        </div>

        <div
          role="group"
          aria-label="Observer freeze mode"
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
            const active = freezeOnceVisible === option.freeze;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => setFreezeOnceVisible(option.freeze)}
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
