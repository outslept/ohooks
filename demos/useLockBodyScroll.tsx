'use client';

import { useEffect, useRef, useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';

const GAP_MODES = [
  { id: 'true', label: 'gap: true', value: true },
  { id: 'false', label: 'gap: false', value: false },
] as const;

export default function UseLockBodyScrollDemo() {
  const [locked, setLocked] = useState(false);
  const [reserveGap, setReserveGap] = useState(true);
  const [bodyStyles, setBodyStyles] = useState({
    overflow: 'visible',
    paddingRight: '0px',
  });
  const frameRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useLockBodyScroll(locked, { reserveScrollBarGap: reserveGap });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      setBodyStyles({
        overflow: document.body.style.overflow || 'visible',
        paddingRight: document.body.style.paddingRight || '0px',
      });
    }

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (
      typeof window !== 'undefined' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      frameRef.current?.animate(
        [
          { transform: 'scale3d(0.97, 0.97, 1)', opacity: 0.75 },
          { transform: 'scale3d(1, 1, 1)', opacity: 1 },
        ],
        { duration: 200, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }
      );
    }
  }, [locked, reserveGap]);

  const activeGapIndex = reserveGap ? 0 : 1;

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border bg-fd-card p-4 text-fd-card-foreground shadow-xs">
      <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-lg border bg-fd-muted/30">
        <div
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        <div
          ref={frameRef}
          className="relative flex w-64 flex-col items-center justify-center gap-2 border border-fd-primary/25 bg-fd-card/70 px-5 py-3.5 shadow-2xs backdrop-blur-[2px]"
        >
          <span
            className=" -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: locked ? 1 : 0.35 }}
          />
          <span
            className=" -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: locked ? 1 : 0.35 }}
          />
          <span
            className=" -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: locked ? 1 : 0.35 }}
          />
          <span
            className=" -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: locked ? 1 : 0.35 }}
          />

          <div className="flex items-center gap-1.5 text-[10px] font-medium tracking-wider text-fd-muted-foreground uppercase">
            <span
              className={`size-1.5 rounded-full transition-colors duration-150 ${
                locked ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            />
            <span>document.body</span>
          </div>

          <div className="flex items-center gap-2">
            {locked ? (
              <Lock className="size-4 text-amber-500" />
            ) : (
              <Unlock className="size-4 text-emerald-500" />
            )}
            <span className="font-mono text-xl font-bold tracking-tight text-fd-foreground">
              {locked ? 'LOCKED' : 'UNLOCKED'}
            </span>
          </div>

          <div className="mt-0.5 flex w-full items-center justify-between border-t border-fd-border/60 pt-2 font-mono text-[11px] text-fd-muted-foreground tabular-nums">
            <span>
              overflow:{' '}
              <strong className="text-fd-foreground">
                {bodyStyles.overflow}
              </strong>
            </span>
            <span>
              pad-r:{' '}
              <strong className="text-fd-foreground">
                {bodyStyles.paddingRight}
              </strong>
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <button
          type="button"
          onClick={() => setLocked((prev) => !prev)}
          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.97] ${
            locked
              ? 'bg-amber-500/15 text-amber-500 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-amber-500/20'
              : 'bg-fd-primary/10 text-fd-primary [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15'
          }`}
        >
          {locked ? (
            <Unlock className="size-3.5" />
          ) : (
            <Lock className="size-3.5" />
          )}
          {locked ? 'Unlock scroll' : 'Lock scroll'}
        </button>

        <div
          role="group"
          aria-label="Reserve scrollbar gap"
          className="relative grid grid-cols-2 items-center rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-0.25rem)/2)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activeGapIndex * 100}%, 0, 0)`,
            }}
          />
          {GAP_MODES.map((item) => {
            const isSelected = reserveGap === item.value;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setReserveGap(item.value)}
                className={`relative z-10 px-2.5 py-0.5 font-mono text-[11px] font-medium transition-[color,transform] duration-150 ease-out active:scale-[0.97] ${
                  isSelected
                    ? 'text-fd-foreground'
                    : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-foreground'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
