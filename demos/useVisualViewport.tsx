'use client';

import { useEffect, useRef, useState } from 'react';
import { useVisualViewport } from '@/hooks/useVisualViewport';

export default function UseVisualViewportDemo() {
  const {
    width,
    height,
    scale,
    offsetLeft,
    offsetTop,
    pageTop,
    isSupported,
  } = useVisualViewport();

  const [isActive, setIsActive] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setIsActive(true);
    const id = window.setTimeout(() => setIsActive(false), 160);
    return () => window.clearTimeout(id);
  }, [width, height, scale, offsetLeft, offsetTop, pageTop]);

  const scaleX = width > 0 ? Math.min(1, Math.max(0.28, width / 1920)) : 0.75;
  const scaleY = height > 0 ? Math.min(1, Math.max(0.32, height / 1080)) : 0.75;
  const shiftX = Math.max(-24, Math.min(24, offsetLeft * 0.08));
  const shiftY = Math.max(-20, Math.min(20, offsetTop * 0.08));

  const roundedW = Math.round(width);
  const roundedH = Math.round(height);
  const roundedOffsetX = Math.round(offsetLeft);
  const roundedOffsetY = Math.round(offsetTop);
  const roundedPageTop = Math.round(pageTop);

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
          className="pointer-events-none absolute h-32 w-60 border border-fd-primary/25 bg-fd-card/70 shadow-2xs backdrop-blur-[2px] will-change-transform"
          style={{
            transform: `translate3d(${shiftX.toFixed(1)}px, ${shiftY.toFixed(1)}px, 0) scale3d(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)}, 1)`,
          }}
        >
          <span
            className="absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isActive ? 1 : 0.45 }}
          />
          <span
            className="absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isActive ? 1 : 0.45 }}
          />
          <span
            className="absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isActive ? 1 : 0.45 }}
          />
          <span
            className="absolute -bottom-px -right-px size-2 border-b-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isActive ? 1 : 0.45 }}
          />
        </div>

        <div
          className="relative z-10 flex flex-col items-center gap-1 font-mono tabular-nums transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
          style={{
            transform: isActive ? 'scale(1.02)' : 'scale(1)',
          }}
        >
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-semibold tracking-tight text-fd-card-foreground">
              {roundedW}
            </span>
            <span className="text-sm text-fd-muted-foreground">×</span>
            <span className="text-2xl font-semibold tracking-tight text-fd-card-foreground">
              {roundedH}
            </span>
            <span className="ml-0.5 text-xs text-fd-muted-foreground">px</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-fd-muted-foreground">
            <span>
              offset {roundedOffsetX},{roundedOffsetY}
            </span>
            <span aria-hidden="true" className="text-fd-border">
              ·
            </span>
            <span>pageTop {roundedPageTop}px</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-2 font-mono text-fd-muted-foreground tabular-nums">
          <span className="inline-flex items-center rounded-md bg-fd-primary/10 px-2 py-0.5 font-semibold text-fd-primary">
            {scale.toFixed(2)}x
          </span>
          <span aria-hidden="true" className="text-fd-border">
            ·
          </span>
          <span className="text-[11px]">
            {isSupported ? 'supported' : 'fallback'}
          </span>
        </div>

        <input
          type="text"
          aria-label="Test virtual keyboard resize"
          placeholder="Focus to test keyboard…"
          className="h-7 w-44 rounded-lg border bg-fd-muted/40 px-2.5 font-mono text-[11px] text-fd-card-foreground placeholder:text-fd-muted-foreground focus:border-fd-primary/40 focus:bg-fd-card focus:outline-none"
        />
      </div>
    </div>
  );
}
