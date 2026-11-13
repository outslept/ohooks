'use client';

import { useCallback, useRef, useState } from 'react';
import { Maximize2 } from 'lucide-react';
import { useMeasure } from '@/hooks/useMeasure';

const PRESETS = [
  { w: 224, h: 98 },
  { w: 264, h: 114 },
  { w: 304, h: 130 },
] as const;

const MODES = [
  { id: 'content-box', label: 'content-box' },
  { id: 'border-box', label: 'border-box' },
  { id: 'off', label: 'off' },
] as const;

type ModeId = (typeof MODES)[number]['id'];

export default function UseMeasureDemo() {
  const [mode, setMode] = useState<ModeId>('content-box');
  const [presetIndex, setPresetIndex] = useState(1);
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const readoutRef = useRef<HTMLDivElement>(null);

  const isEnabled = mode !== 'off';
  const boxOption: ResizeObserverBoxOptions =
    mode === 'border-box' ? 'border-box' : 'content-box';

  const [measureRef, rect] = useMeasure<HTMLDivElement>({
    box: boxOption,
    enabled: isEnabled,
  });

  const attachRef = useCallback(
    (node: HTMLDivElement | null) => {
      nodeRef.current = node;
      measureRef(node);
    },
    [measureRef]
  );

  const pulseReadout = () => {
    if (
      typeof window !== 'undefined' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      readoutRef.current?.animate(
        [
          { transform: 'scale3d(0.97, 0.97, 1)', opacity: 0.75 },
          { transform: 'scale3d(1, 1, 1)', opacity: 1 },
        ],
        { duration: 180, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }
      );
    }
  };

  const cyclePreset = () => {
    const nextIndex = (presetIndex + 1) % PRESETS.length;
    const nextPreset = PRESETS[nextIndex];
    setPresetIndex(nextIndex);

    if (nodeRef.current) {
      nodeRef.current.style.width = `${nextPreset.w}px`;
      nodeRef.current.style.height = `${nextPreset.h}px`;
    }
    pulseReadout();
  };

  const selectMode = (nextMode: ModeId) => {
    setMode(nextMode);
    pulseReadout();
  };

  const currentPreset = PRESETS[presetIndex];
  const activeModeIndex = MODES.findIndex((item) => item.id === mode);

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
          ref={attachRef}
          style={{
            width: `${currentPreset.w}px`,
            height: `${currentPreset.h}px`,
            minWidth: '188px',
            minHeight: '86px',
            maxWidth: '336px',
            maxHeight: '148px',
          }}
          className="relative flex resize items-center justify-center overflow-hidden border border-fd-primary/25 bg-fd-card/70 px-4 py-3 shadow-2xs backdrop-blur-[2px]"
        >
          <span
            className="pointer-events-none -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: isEnabled ? 1 : 0.35 }}
          />
          <span
            className="pointer-events-none -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: isEnabled ? 1 : 0.35 }}
          />
          <span
            className="pointer-events-none -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: isEnabled ? 1 : 0.35 }}
          />
          <span
            className="pointer-events-none -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: isEnabled ? 1 : 0.35 }}
          />

          <div
            ref={readoutRef}
            className="pointer-events-none flex flex-col items-center justify-center gap-1 select-none"
          >
            <div className="flex items-center gap-1.5 text-[10px] font-medium tracking-wider text-fd-muted-foreground uppercase">
              <span
                className={`size-1.5 rounded-full transition-colors duration-150 ${
                  isEnabled ? 'bg-fd-primary' : 'bg-fd-muted-foreground/50'
                }`}
              />
              <span>{isEnabled ? boxOption : 'paused'}</span>
            </div>

            <div className="flex items-baseline gap-1.5 font-mono text-lg font-bold tracking-tight text-fd-foreground tabular-nums">
              <span>{Math.round(rect.width)}</span>
              <span className="text-xs font-normal text-fd-muted-foreground">
                ×
              </span>
              <span>{Math.round(rect.height)}</span>
              <span className="text-[11px] font-normal text-fd-muted-foreground">
                px
              </span>
            </div>

            <div className="font-mono text-[10px] text-fd-muted-foreground tabular-nums">
              inset: ({Math.round(rect.left)}, {Math.round(rect.top)}) → (
              {Math.round(rect.right)}, {Math.round(rect.bottom)})
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <button
          type="button"
          onClick={cyclePreset}
          className="inline-flex items-center gap-1.5 rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15"
        >
          <Maximize2 className="size-3.5" />
          Cycle size
        </button>

        <div
          role="group"
          aria-label="Measurement box model"
          className="relative grid grid-cols-3 items-center rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-0.25rem)/3)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activeModeIndex * 100}%, 0, 0)`,
            }}
          />
          {MODES.map((item) => {
            const isSelected = mode === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectMode(item.id)}
                className={`relative z-10 px-2 py-0.5 font-mono text-[11px] font-medium transition-[color,transform] duration-150 ease-out active:scale-[0.97] ${
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
