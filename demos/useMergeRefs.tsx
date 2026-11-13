'use client';

import { useCallback, useRef, useState } from 'react';
import { Crosshair } from 'lucide-react';
import { useMergeRefs } from '@/hooks/useMergeRefs';

const CALLBACK_MODES = [
  { id: 'attached', label: '3rd ref: on' },
  { id: 'detached', label: '3rd ref: off' },
] as const;

type CallbackMode = (typeof CALLBACK_MODES)[number]['id'];

export default function UseMergeRefsDemo() {
  const focusRef = useRef<HTMLInputElement>(null);
  const pulseRef = useRef<HTMLInputElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<CallbackMode>('attached');
  const [dimensions, setDimensions] = useState<{ w: number; h: number } | null>(
    null
  );
  const [cleanupRuns, setCleanupRuns] = useState(0);
  const [value, setValue] = useState('merged-node-01');

  const measureCallbackRef = useCallback((node: HTMLInputElement | null) => {
    if (!node) return;
    const rect = node.getBoundingClientRect();
    setDimensions({
      w: Math.round(rect.width),
      h: Math.round(rect.height),
    });

    return () => {
      setDimensions(null);
      setCleanupRuns((count) => count + 1);
    };
  }, []);

  const mergedRef = useMergeRefs<HTMLInputElement>(
    focusRef,
    pulseRef,
    mode === 'attached' ? measureCallbackRef : null
  );

  const triggerFocusAndPulse = () => {
    focusRef.current?.focus();
    focusRef.current?.select();

    if (
      typeof window !== 'undefined' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      pulseRef.current?.animate(
        [
          { transform: 'scale3d(0.97, 0.97, 1)' },
          { transform: 'scale3d(1, 1, 1)' },
        ],
        { duration: 180, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }
      );
    }
  };

  const handleModeChange = (nextMode: CallbackMode) => {
    if (nextMode === mode) return;
    setMode(nextMode);

    if (
      typeof window !== 'undefined' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      frameRef.current?.animate(
        [
          { transform: 'scale3d(0.98, 0.98, 1)', opacity: 0.8 },
          { transform: 'scale3d(1, 1, 1)', opacity: 1 },
        ],
        { duration: 180, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }
      );
    }
  };

  const activeModeIndex = CALLBACK_MODES.findIndex((item) => item.id === mode);
  const activeRefCount = mode === 'attached' ? 3 : 2;

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
          className="relative flex w-68 flex-col items-center justify-center gap-2.5 border border-fd-primary/25 bg-fd-card/70 px-4 py-3.5 shadow-2xs backdrop-blur-[2px]"
        >
          <span
            className=" -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: mode === 'attached' ? 1 : 0.45 }}
          />
          <span
            className=" -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: mode === 'attached' ? 1 : 0.45 }}
          />
          <span
            className=" -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: mode === 'attached' ? 1 : 0.45 }}
          />
          <span
            className=" -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: mode === 'attached' ? 1 : 0.45 }}
          />

          <div className="flex w-full items-center justify-between font-mono text-[10px] tracking-wider text-fd-muted-foreground uppercase tabular-nums">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-fd-primary" />
              <span>merged: {activeRefCount} refs</span>
            </span>
            <span>cleanups: {cleanupRuns}</span>
          </div>

          <input
            ref={mergedRef}
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            aria-label="Merged ref target input"
            className="w-full rounded-md border border-fd-border bg-fd-muted/40 px-2.5 py-1.5 text-center font-mono text-xs font-semibold text-fd-foreground focus:border-fd-primary focus:outline-none"
          />

          <div className="flex w-full items-center justify-between border-t border-fd-border/60 pt-2 font-mono text-[11px] text-fd-muted-foreground tabular-nums">
            <span>ref[0]: RefObject</span>
            <span>
              ref[2]:{' '}
              <span className="text-fd-foreground">
                {dimensions ? `${dimensions.w}×${dimensions.h}px` : 'cleaned up'}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <button
          type="button"
          onClick={triggerFocusAndPulse}
          className="inline-flex items-center gap-1.5 rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15"
        >
          <Crosshair className="size-3.5" />
          Focus via RefObject
        </button>

        <div
          role="group"
          aria-label="Callback ref attachment state"
          className="relative grid grid-cols-2 items-center rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-0.25rem)/2)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activeModeIndex * 100}%, 0, 0)`,
            }}
          />
          {CALLBACK_MODES.map((item) => {
            const isSelected = mode === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleModeChange(item.id)}
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
