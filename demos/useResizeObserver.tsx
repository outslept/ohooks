'use client';

import { Pause, Play, RotateCcw } from 'lucide-react';
import { useRef, useState } from 'react';
import { useResizeObserver } from '@/hooks/useResizeObserver';

const PRESETS = [
  { key: 'sm', label: 'SM', width: 210, height: 92 },
  { key: 'md', label: 'MD', width: 264, height: 108 },
  { key: 'lg', label: 'LG', width: 316, height: 126 },
] as const;

type PresetKey = (typeof PRESETS)[number]['key'];

export default function UseResizeObserverDemo() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [presetKey, setPresetKey] = useState<PresetKey>('md');
  const [enabled, setEnabled] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 264, height: 108 });
  const [eventCount, setEventCount] = useState(0);

  useResizeObserver(
    boxRef,
    (entry) => {
      const nextWidth = Math.round(entry.contentRect.width);
      const nextHeight = Math.round(entry.contentRect.height);
      setDimensions((prev) =>
        prev.width === nextWidth && prev.height === nextHeight
          ? prev
          : { width: nextWidth, height: nextHeight }
      );
      setEventCount((c) => c + 1);
    },
    { enabled }
  );

  const applyPreset = (key: PresetKey) => {
    setPresetKey(key);
    const preset = PRESETS.find((p) => p.key === key);
    const el = boxRef.current;
    if (preset && el) {
      el.style.width = `${preset.width}px`;
      el.style.height = `${preset.height}px`;
    }
  };

  const presetIndex = PRESETS.findIndex((p) => p.key === presetKey);

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
          ref={boxRef}
          style={{ width: '264px', height: '108px' }}
          className="relative flex max-h-[148px] min-h-[84px] max-w-[calc(100%-1.5rem)] min-w-[190px] resize flex-col justify-between overflow-hidden border border-fd-primary/25 bg-fd-card/70 p-3 shadow-2xs backdrop-blur-[2px]"
        >
          <span
            className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: enabled ? 1 : 0.35 }}
          />
          <span
            className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: enabled ? 1 : 0.35 }}
          />
          <span
            className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: enabled ? 1 : 0.35 }}
          />

          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-wider uppercase text-fd-muted-foreground">
              <span
                className={`size-1.5 rounded-full transition-colors duration-150 ease-out ${
                  enabled ? 'bg-fd-primary' : 'bg-fd-muted-foreground/40'
                }`}
              />
              {enabled ? 'observing' : 'paused'}
            </span>
            <span className="font-mono text-[10px] tabular-nums text-fd-muted-foreground">
              #{eventCount}
            </span>
          </div>

          <div className="flex items-baseline justify-center gap-1.5 font-mono tabular-nums">
            <span className="text-lg font-bold text-fd-card-foreground">
              {dimensions.width}
            </span>
            <span className="text-xs text-fd-muted-foreground">×</span>
            <span className="text-lg font-bold text-fd-primary">
              {dimensions.height}
            </span>
            <span className="text-[10px] text-fd-muted-foreground">px</span>
          </div>

          <div className="flex items-center justify-between font-mono text-[10px] text-fd-muted-foreground">
            <span>content-box</span>
            <span>drag corner ↘</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setEnabled((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15"
          >
            {enabled ? (
              <Pause className="size-3" />
            ) : (
              <Play className="size-3" />
            )}
            {enabled ? 'Pause' : 'Observe'}
          </button>

          <button
            type="button"
            onClick={() => applyPreset(presetKey)}
            aria-label="Reset box dimensions to preset"
            className="inline-flex size-6 items-center justify-center rounded-lg border bg-fd-muted/40 text-fd-muted-foreground transition-[transform,color,background-color] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-card-foreground"
          >
            <RotateCcw className="size-3" />
          </button>
        </div>

        <div
          role="group"
          aria-label="Box size presets"
          className="relative grid grid-cols-3 rounded-lg border bg-fd-muted/50 p-0.5"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/3)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${presetIndex * 100}%, 0, 0)`,
            }}
          />
          {PRESETS.map((preset) => {
            const active = presetKey === preset.key;
            return (
              <button
                key={preset.key}
                type="button"
                onClick={() => applyPreset(preset.key)}
                className={`relative z-10 rounded-md px-2.5 py-0.5 font-mono text-[11px] font-medium transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
                  active
                    ? 'text-fd-card-foreground'
                    : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-card-foreground'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
