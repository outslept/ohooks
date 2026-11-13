'use client';

import { useRef, useState } from 'react';
import { useElementSize } from '@/hooks/useElementSize';

type BoxMode = 'border-box' | 'content-box';

const BOX_MODES: { value: BoxMode; label: string }[] = [
  { value: 'border-box', label: 'border-box' },
  { value: 'content-box', label: 'content-box' },
];

const PRESETS = [
  { width: 200, height: 96, label: '200×96' },
  { width: 260, height: 120, label: '260×120' },
  { width: 156, height: 76, label: '156×76' },
] as const;

export default function UseElementSizeDemo() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [boxMode, setBoxMode] = useState<BoxMode>('border-box');
  const [presetIdx, setPresetIdx] = useState(0);

  const { width, height } = useElementSize(boxRef, {
    box: boxMode,
    initialWidth: PRESETS[0].width,
    initialHeight: PRESETS[0].height,
  });

  const cyclePreset = () => {
    const nextIdx = (presetIdx + 1) % PRESETS.length;
    setPresetIdx(nextIdx);
    const el = boxRef.current;
    if (el) {
      el.style.width = `${PRESETS[nextIdx].width}px`;
      el.style.height = `${PRESETS[nextIdx].height}px`;
    }
  };

  const activeBoxIdx = BOX_MODES.findIndex((m) => m.value === boxMode);

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border bg-fd-card p-4 text-fd-card-foreground shadow-xs">
      <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-lg border bg-fd-muted/30 p-3">
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
          style={{
            width: `${PRESETS[0].width}px`,
            height: `${PRESETS[0].height}px`,
          }}
          className="relative flex max-h-full max-w-full min-h-[68px] min-w-[136px] resize-both flex-col items-center justify-center overflow-hidden border border-fd-primary/30 bg-fd-card/80 p-3 shadow-2xs backdrop-blur-[2px]"
        >
          <span className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary" />
          <span className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary" />
          <span className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary" />

          <div className="pointer-events-none flex items-baseline gap-1 font-mono text-sm font-semibold tabular-nums tracking-tight text-fd-foreground">
            <span>{Math.round(width)}</span>
            <span className="text-xs font-normal text-fd-muted-foreground">×</span>
            <span>{Math.round(height)}</span>
            <span className="ml-0.5 text-[10px] font-normal text-fd-muted-foreground">
              px
            </span>
          </div>

          <span className="pointer-events-none mt-0.5 font-mono text-[10px] text-fd-muted-foreground">
            {boxMode === 'content-box' ? 'padding excluded' : 'padding + border'}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <button
          type="button"
          onClick={cyclePreset}
          className="rounded-lg border bg-fd-muted/40 px-2.5 py-1 font-mono text-[11px] font-medium tabular-nums text-fd-card-foreground transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted/70 motion-reduce:transition-none"
        >
          Preset {PRESETS[(presetIdx + 1) % PRESETS.length].label}
        </button>

        <div
          role="group"
          aria-label="Box model"
          className="relative grid grid-cols-2 rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/2)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activeBoxIdx * 100}%, 0, 0)`,
            }}
          />
          {BOX_MODES.map((mode) => {
            const active = boxMode === mode.value;
            return (
              <button
                key={mode.value}
                type="button"
                onClick={() => setBoxMode(mode.value)}
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
