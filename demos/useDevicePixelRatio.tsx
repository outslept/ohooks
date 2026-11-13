'use client';

import { useState } from 'react';
import { useDevicePixelRatio } from '@/hooks/useDevicePixelRatio';

const CSS_SIZES = [64, 128, 256] as const;

export default function UseDevicePixelRatioDemo() {
  const dpr = useDevicePixelRatio({ defaultValue: 1 });
  const [cssSize, setCssSize] = useState<(typeof CSS_SIZES)[number]>(128);

  const physicalSize = Math.round(cssSize * dpr);
  const dpi = Math.round(dpr * 96);
  const activeSizeIdx = CSS_SIZES.indexOf(cssSize);

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

        <div className="relative flex w-56 flex-col items-center justify-center gap-1.5 border border-fd-primary/30 bg-fd-card/85 px-4 py-3.5 shadow-2xs backdrop-blur-[2px]">
          <span className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary" />
          <span className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary" />
          <span className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary" />
          <span className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary" />

          <div className="flex items-baseline gap-2 font-mono tabular-nums">
            <span className="text-2xl font-semibold tracking-tight text-fd-foreground">
              {dpr.toFixed(2)}x
            </span>
            <span className="rounded bg-fd-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-fd-primary">
              {dpi} DPI
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px] tabular-nums text-fd-muted-foreground">
            <span>{cssSize}px CSS</span>
            <span>→</span>
            <span className="font-semibold text-fd-foreground">
              {physicalSize}×{physicalSize}px
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <span className="font-mono text-[11px] tabular-nums text-fd-muted-foreground">
          resolution: {Number(dpr.toFixed(2))}dppx
        </span>

        <div
          role="group"
          aria-label="CSS reference size"
          className="relative grid grid-cols-3 rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/3)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activeSizeIdx * 100}%, 0, 0)`,
            }}
          />
          {CSS_SIZES.map((size) => {
            const active = cssSize === size;
            return (
              <button
                key={size}
                type="button"
                onClick={() => setCssSize(size)}
                className={`relative z-10 rounded-md px-2 py-0.5 font-mono text-[11px] font-medium tabular-nums transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
                  active
                    ? 'text-fd-foreground'
                    : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-foreground'
                }`}
              >
                {size}px
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
