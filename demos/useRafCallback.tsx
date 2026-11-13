'use client';

import { RotateCcw, Zap } from 'lucide-react';
import { useState } from 'react';
import { useRafCallback } from '@/hooks/useRafCallback';

const MODES = ['raf', 'flush', 'cancel'] as const;
type ExecMode = (typeof MODES)[number];

export default function UseRafCallbackDemo() {
  const [mode, setMode] = useState<ExecMode>('raf');
  const [rawEvents, setRawEvents] = useState(0);
  const [rafEvents, setRafEvents] = useState(0);
  const [coords, setCoords] = useState({ x: 50, y: 50 });
  const [isTracking, setIsTracking] = useState(false);

  const updateOnFrame = useRafCallback((x: number, y: number) => {
    setRafEvents((c) => c + 1);
    setCoords({ x, y });
  });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nativeEvent = e.nativeEvent as PointerEvent & {
      getCoalescedEvents?: () => PointerEvent[];
    };
    const samples =
      typeof nativeEvent.getCoalescedEvents === 'function'
        ? nativeEvent.getCoalescedEvents()
        : [nativeEvent];
    const events = samples.length > 0 ? samples : [nativeEvent];

    setRawEvents((c) => c + events.length);

    for (const sample of events) {
      const x = Math.round(((sample.clientX - rect.left) / rect.width) * 100);
      const y = Math.round(((sample.clientY - rect.top) / rect.height) * 100);
      updateOnFrame(
        Math.max(0, Math.min(100, x)),
        Math.max(0, Math.min(100, y))
      );
    }

    if (mode === 'flush') {
      updateOnFrame.flush();
    } else if (mode === 'cancel') {
      updateOnFrame.cancel();
    }
  };

  const handleBurst = () => {
    const burstSize = 20;
    setRawEvents((c) => c + burstSize);

    for (let i = 1; i <= burstSize; i += 1) {
      const nextX = Math.round(15 + ((coords.x + i * 17) % 70));
      const nextY = Math.round(15 + ((coords.y + i * 13) % 70));
      updateOnFrame(nextX, nextY);
    }

    if (mode === 'flush') {
      updateOnFrame.flush();
    } else if (mode === 'cancel') {
      updateOnFrame.cancel();
    }
  };

  const handleReset = () => {
    updateOnFrame.cancel();
    setRawEvents(0);
    setRafEvents(0);
    setCoords({ x: 50, y: 50 });
  };

  const offsetX = Math.round((coords.x - 50) * 0.45);
  const offsetY = Math.round((coords.y - 50) * 0.28);
  const savedCount = Math.max(0, rawEvents - rafEvents);
  const modeIndex = MODES.indexOf(mode);

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border bg-fd-card p-4 text-fd-card-foreground shadow-xs">
      <div
        onPointerEnter={() => setIsTracking(true)}
        onPointerLeave={() => setIsTracking(false)}
        onPointerMove={handlePointerMove}
        className="relative flex h-44 w-full cursor-crosshair touch-none items-center justify-center overflow-hidden rounded-lg border bg-fd-muted/30 select-none"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        <div
          className={`relative flex w-64 flex-col gap-2.5 border border-fd-primary/25 bg-fd-card/70 p-3.5 shadow-2xs backdrop-blur-[2px] ${
            isTracking
              ? 'transition-none'
              : 'transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none'
          }`}
          style={{
            transform: `translate3d(${offsetX}px, ${offsetY}px, 0)`,
          }}
        >
          <span
            className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isTracking ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isTracking ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isTracking ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isTracking ? 1 : 0.45 }}
          />

          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-wider uppercase text-fd-muted-foreground">
              <span
                className={`size-1.5 rounded-full transition-colors duration-150 ease-out ${
                  isTracking ? 'bg-fd-primary' : 'bg-fd-muted-foreground/40'
                }`}
              />
              {mode === 'cancel'
                ? 'canceled'
                : mode === 'flush'
                  ? 'sync flush'
                  : '1x per frame'}
            </span>
            <span className="font-mono text-[10px] tabular-nums text-fd-muted-foreground">
              {coords.x}%, {coords.y}%
            </span>
          </div>

          <div className="grid grid-cols-2 items-center gap-2 border-y border-fd-border/60 py-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-medium tracking-wider uppercase text-fd-muted-foreground">
                Raw Calls
              </span>
              <span className="font-mono text-2xl font-bold tabular-nums text-fd-card-foreground">
                {rawEvents}
              </span>
            </div>
            <div className="flex flex-col border-l border-fd-border/60 pl-3">
              <span className="text-[10px] font-medium tracking-wider uppercase text-fd-primary">
                rAF Runs
              </span>
              <span className="font-mono text-2xl font-bold tabular-nums text-fd-primary">
                {rafEvents}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between font-mono text-[10px] tabular-nums text-fd-muted-foreground">
            <span>coalesced: {savedCount}</span>
            <span>move pointer or burst</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleBurst}
            className="inline-flex items-center gap-1.5 rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15"
          >
            <Zap className="size-3" />
            Burst ×20
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={rawEvents === 0}
            aria-label="Reset counters"
            className="inline-flex size-6 items-center justify-center rounded-lg border bg-fd-muted/40 text-fd-muted-foreground transition-[transform,color,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-card-foreground"
          >
            <RotateCcw className="size-3" />
          </button>
        </div>

        <div
          role="group"
          aria-label="rAF control mode"
          className="relative grid grid-cols-3 rounded-lg border bg-fd-muted/50 p-0.5"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/3)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${modeIndex * 100}%, 0, 0)`,
            }}
          />
          {MODES.map((m) => {
            const active = mode === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`relative z-10 rounded-md px-2.5 py-0.5 font-mono text-[11px] font-medium transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
                  active
                    ? 'text-fd-card-foreground'
                    : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-card-foreground'
                }`}
              >
                {m === 'raf' ? 'rAF' : m}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
