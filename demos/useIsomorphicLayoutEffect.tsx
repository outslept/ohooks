'use client';

import { useRef, useState } from 'react';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';

const PRESETS = [
  'Measured synchronously before paint',
  'Zero layout flicker',
  'SSR-safe useLayoutEffect',
] as const;

const SIZE_OPTIONS = [
  { label: '12px', className: 'text-xs' },
  { label: '14px', className: 'text-sm' },
  { label: '16px', className: 'text-base' },
] as const;

export default function UseIsomorphicLayoutEffectDemo() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState<string>(PRESETS[0]);
  const [sizeIdx, setSizeIdx] = useState<number>(0);
  const [rect, setRect] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  useIsomorphicLayoutEffect(() => {
    const node = boxRef.current;
    if (!node) return;

    const bounds = node.getBoundingClientRect();
    const width = Math.round(bounds.width);
    const height = Math.round(bounds.height);

    setRect((prev) =>
      prev.width === width && prev.height === height ? prev : { width, height },
    );
  }, [text, sizeIdx]);

  const cyclePreset = () => {
    const currentIdx = PRESETS.indexOf(text as (typeof PRESETS)[number]);
    const nextIdx = (currentIdx + 1) % PRESETS.length;
    setText(PRESETS[nextIdx]);
  };

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border bg-fd-card p-4 text-fd-card-foreground shadow-xs">
      <div className="relative flex h-44 w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-lg border bg-fd-muted/30 px-4">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        <div
          ref={boxRef}
          className="relative z-10 inline-flex max-w-full flex-col items-center gap-1 border border-fd-primary/25 bg-fd-card/80 px-4 py-2.5 shadow-2xs backdrop-blur-[2px]"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary"
          />

          <span
            className={`max-w-full truncate font-medium text-fd-card-foreground ${SIZE_OPTIONS[sizeIdx].className}`}
          >
            {text || 'Empty'}
          </span>
          <span className="font-mono text-[10px] text-fd-primary tabular-nums">
            {rect.width} × {rect.height} px
          </span>
        </div>

        <div className="relative z-10 flex w-full max-w-sm items-center gap-1.5">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type to measure pre-paint..."
            aria-label="Measured text content"
            className="h-8 flex-1 rounded-md border bg-fd-card/90 px-2.5 text-xs text-fd-card-foreground placeholder:text-fd-muted-foreground focus:border-fd-primary focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={cyclePreset}
            className="rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15 motion-reduce:transition-none"
          >
            Cycle preset
          </button>
          <span className="font-mono text-[11px] text-fd-muted-foreground tabular-nums">
            w: <strong className="text-fd-card-foreground">{rect.width}px</strong>
          </span>
        </div>

        <div
          role="group"
          aria-label="Font size"
          className="relative grid grid-cols-3 rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/3)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${sizeIdx * 100}%, 0, 0)`,
            }}
          />
          {SIZE_OPTIONS.map((option, idx) => {
            const active = sizeIdx === idx;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => setSizeIdx(idx)}
                className={`relative z-10 rounded-md px-2.5 py-1 font-mono text-[11px] font-medium tabular-nums transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
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
