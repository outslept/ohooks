'use client';

import { useMemo, useRef, useState } from 'react';
import { useVirtualList } from '@/hooks/useVirtualList';

const OVERSCAN_OPTIONS = [0, 4, 10] as const;
const JUMP_TARGETS = [0, 500, 5000, 9999] as const;
const ROW_HEIGHT = 36;

export default function UseVirtualListDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [overscanIdx, setOverscanIdx] = useState(1);
  const overscan = OVERSCAN_OPTIONS[overscanIdx];

  const allRows = useMemo(
    () =>
      Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        label: `row_${String(i).padStart(4, '0')}`,
        latency: `${((i * 17) % 90) + 10}ms`,
      })),
    [],
  );

  const { virtualItems, wrapperProps, scrollToIndex } = useVirtualList(
    allRows,
    {
      containerTarget: containerRef,
      itemHeight: ROW_HEIGHT,
      overscan,
    },
  );

  const firstIdx = virtualItems[0]?.index ?? 0;
  const lastIdx = virtualItems[virtualItems.length - 1]?.index ?? 0;

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border bg-fd-card p-4 text-fd-card-foreground shadow-xs">
      <div className="relative h-44 w-full overflow-hidden rounded-lg border bg-fd-muted/30">
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
          ref={containerRef}
          className="relative h-full w-full overflow-y-auto font-mono text-xs tabular-nums"
        >
          <div {...wrapperProps}>
            {virtualItems.map(({ data, index, offsetTop, height }) => (
              <div
                key={data.id}
                style={{
                  height,
                  transform: `translate3d(0, ${offsetTop}px, 0)`,
                }}
                className=" inset-x-0 top-0 absolute flex items-center justify-between border-b border-fd-border/60 bg-fd-card/75 px-3.5 backdrop-blur-[1px]"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-[11px] text-fd-muted-foreground">
                    #{index}
                  </span>
                  <span className="font-medium text-fd-card-foreground">
                    {data.label}
                  </span>
                </div>
                <span className="rounded bg-fd-muted/70 px-1.5 py-0.5 text-[10px] text-fd-muted-foreground">
                  {data.latency}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pointer-events-none absolute right-2.5 bottom-2 rounded-md border bg-fd-card/90 px-2 py-0.5 font-mono text-[10px] text-fd-muted-foreground tabular-nums shadow-2xs backdrop-blur-xs">
          DOM {virtualItems.length}/10,000 · #{firstIdx}–#{lastIdx}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex flex-wrap items-center gap-1.5 font-mono tabular-nums">
          {JUMP_TARGETS.map((idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => scrollToIndex(idx, 'smooth')}
              className="inline-flex items-center rounded-lg border bg-fd-muted/40 px-2.5 py-1 text-[11px] font-medium text-fd-card-foreground transition-[transform,color,background-color] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted"
            >
              #{idx}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-fd-muted-foreground">
            overscan
          </span>
          <div
            role="group"
            aria-label="Overscan count"
            className="relative grid grid-cols-3 rounded-lg border bg-fd-muted/50 p-0.5 font-mono text-[11px] tabular-nums"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/3)] rounded-[6px] bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
              style={{
                transform: `translate3d(${overscanIdx * 100}%, 0, 0)`,
              }}
            />
            {OVERSCAN_OPTIONS.map((val, idx) => {
              const active = idx === overscanIdx;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => setOverscanIdx(idx)}
                  className={`relative z-10 rounded-[6px] px-2 py-1 text-center font-medium transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
                    active
                      ? 'text-fd-card-foreground'
                      : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-card-foreground'
                  }`}
                >
                  {val}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
