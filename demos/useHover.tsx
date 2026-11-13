'use client';

import { useRef, useState } from 'react';
import { useHover } from '@/hooks/useHover';

const DELAY_PRESETS = [
  { label: '0ms', enterDelay: 0, leaveDelay: 0 },
  { label: '150ms', enterDelay: 150, leaveDelay: 150 },
  { label: '400ms', enterDelay: 400, leaveDelay: 400 },
] as const;

export default function UseHoverDemo() {
  const targetRef = useRef<HTMLDivElement>(null);
  const [presetIdx, setPresetIdx] = useState<number>(1);
  const [enterCount, setEnterCount] = useState<number>(0);

  const preset = DELAY_PRESETS[presetIdx];

  const isHovered = useHover(targetRef, {
    enterDelay: preset.enterDelay,
    leaveDelay: preset.leaveDelay,
    onEnter: () => setEnterCount((c) => c + 1),
  });

  const toggleSimulatedHover = () => {
    const el = targetRef.current;
    if (!el) return;
    el.dispatchEvent(
      new MouseEvent(isHovered ? 'mouseleave' : 'mouseenter', {
        bubbles: false,
        cancelable: true,
      }),
    );
  };

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border bg-fd-card p-4 text-fd-card-foreground shadow-xs">
      <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-lg border bg-fd-muted/30 px-4">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        <div
          ref={targetRef}
          style={{
            transform: isHovered
              ? 'scale3d(1.03, 1.03, 1)'
              : 'scale3d(1, 1, 1)',
          }}
          className={`relative z-10 flex min-w-56 cursor-default select-none flex-col items-center gap-1.5 border px-6 py-5 shadow-2xs backdrop-blur-[2px] transition-[transform,border-color,background-color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none ${
            isHovered
              ? 'border-fd-primary/60 bg-fd-primary/10'
              : 'border-fd-primary/25 bg-fd-card/80'
          }`}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isHovered ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isHovered ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isHovered ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isHovered ? 1 : 0.45 }}
          />

          <div className="flex items-center gap-2">
            <span
              className={`size-2 rounded-full transition-colors duration-150 ease-out ${
                isHovered ? 'bg-fd-primary' : 'bg-fd-muted-foreground/40'
              }`}
            />
            <span className="font-mono text-sm font-semibold tracking-wider text-fd-card-foreground uppercase">
              {isHovered ? 'hovered' : 'idle'}
            </span>
          </div>

          <span className="font-mono text-[11px] text-fd-muted-foreground tabular-nums">
            enter: {preset.enterDelay}ms · leave: {preset.leaveDelay}ms
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSimulatedHover}
            className="rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15 motion-reduce:transition-none"
          >
            {isHovered ? 'Leave' : 'Enter'}
          </button>
          <span className="font-mono text-[11px] text-fd-muted-foreground tabular-nums">
            isHovered: <strong className="text-fd-card-foreground">{String(isHovered)}</strong> · enters: <strong className="text-fd-card-foreground">{enterCount}</strong>
          </span>
        </div>

        <div
          role="group"
          aria-label="Hover enter and leave delay"
          className="relative grid grid-cols-3 rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/3)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${presetIdx * 100}%, 0, 0)`,
            }}
          />
          {DELAY_PRESETS.map((option, idx) => {
            const active = presetIdx === idx;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => setPresetIdx(idx)}
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
