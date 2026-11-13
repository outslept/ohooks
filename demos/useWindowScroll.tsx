'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpToLine } from 'lucide-react';
import { useWindowScroll } from '@/hooks/useWindowScroll';

const THROTTLE_OPTIONS = [0, 100, 300] as const;

export default function UseWindowScrollDemo() {
  const [throttleIdx, setThrottleIdx] = useState(0);
  const throttleMs = THROTTLE_OPTIONS[throttleIdx];

  const { x, y, scrollTo } = useWindowScroll({ throttleMs });
  const [isScrolling, setIsScrolling] = useState(false);
  const [maxScroll, setMaxScroll] = useState(1);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const updateMaxScroll = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      setMaxScroll(Math.max(1, scrollable));
    };

    updateMaxScroll();
    window.addEventListener('resize', updateMaxScroll, { passive: true });
    return () => window.removeEventListener('resize', updateMaxScroll);
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setIsScrolling(true);
    const id = window.setTimeout(() => setIsScrolling(false), 160);
    return () => window.clearTimeout(id);
  }, [x, y]);

  const progress = Math.min(1, Math.max(0, y / maxScroll));
  const translateY = (progress - 0.5) * 56;
  const roundedX = Math.round(x);
  const roundedY = Math.round(y);
  const atTop = roundedY <= 0;

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
          className="relative flex h-24 w-56 items-center justify-center border border-fd-primary/25 bg-fd-card/70 shadow-2xs backdrop-blur-[2px] will-change-transform"
          style={{
            transform: `translate3d(0, ${translateY.toFixed(1)}px, 0)`,
          }}
        >
          <span
            aria-hidden="true"
            className="absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isScrolling ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isScrolling ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isScrolling ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-px -right-px size-2 border-b-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isScrolling ? 1 : 0.45 }}
          />

          <div
            className="flex flex-col items-center gap-0.5 font-mono tabular-nums transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: isScrolling ? 'scale(1.02)' : 'scale(1)',
            }}
          >
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs text-fd-muted-foreground">y</span>
              <span className="text-2xl font-semibold tracking-tight text-fd-card-foreground">
                {roundedY}
              </span>
              <span className="text-xs text-fd-muted-foreground">px</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-fd-muted-foreground">
              <span>x {roundedX}px</span>
              <span aria-hidden="true" className="text-fd-border">
                ·
              </span>
              <span>{Math.round(progress * 100)}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1.5 font-mono tabular-nums">
          <button
            type="button"
            disabled={atTop}
            onClick={() =>
              scrollTo({ top: Math.max(0, y - 240), behavior: 'smooth' })
            }
            className="inline-flex items-center gap-1 rounded-lg border bg-fd-muted/40 px-2.5 py-1 text-[11px] font-medium text-fd-card-foreground transition-[transform,color,opacity,background-color] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted"
          >
            <ArrowUp className="size-3" />
            240px
          </button>
          <button
            type="button"
            onClick={() => scrollTo({ top: y + 240, behavior: 'smooth' })}
            className="inline-flex items-center gap-1 rounded-lg border bg-fd-muted/40 px-2.5 py-1 text-[11px] font-medium text-fd-card-foreground transition-[transform,color,background-color] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted"
          >
            <ArrowDown className="size-3" />
            240px
          </button>
          <button
            type="button"
            disabled={atTop}
            onClick={() => scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-1 rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[transform,opacity,background-color] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15"
          >
            <ArrowUpToLine className="size-3" />
            Top
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-fd-muted-foreground">
            throttleMs
          </span>
          <div
            role="group"
            aria-label="Throttle interval"
            className="relative grid grid-cols-3 rounded-lg border bg-fd-muted/50 p-0.5 font-mono text-[11px] tabular-nums"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/3)] rounded-[6px] bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
              style={{
                transform: `translate3d(${throttleIdx * 100}%, 0, 0)`,
              }}
            />
            {THROTTLE_OPTIONS.map((ms, idx) => {
              const active = idx === throttleIdx;
              return (
                <button
                  key={ms}
                  type="button"
                  onClick={() => setThrottleIdx(idx)}
                  className={`relative z-10 rounded-[6px] px-2 py-1 text-center font-medium transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
                    active
                      ? 'text-fd-card-foreground'
                      : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-card-foreground'
                  }`}
                >
                  {ms}ms
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
