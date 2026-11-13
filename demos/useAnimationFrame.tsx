'use client';

import { useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { useAnimationFrame } from '@/hooks/useAnimationFrame';

const FPS_OPTIONS = [
  { label: 'Max', value: undefined },
  { label: '30', value: 30 },
  { label: '15', value: 15 },
] as const;

export default function UseAnimationFrameDemo() {
  const [fpsIdx, setFpsIdx] = useState(0);
  const fpsLimit = FPS_OPTIONS[fpsIdx].value;

  const [elapsed, setElapsed] = useState(0);
  const [delta, setDelta] = useState(0);
  const smoothDeltaRef = useRef(0);

  const { isActive, toggle, stop } = useAnimationFrame(
    ({ deltaTime }) => {
      if (deltaTime <= 0) return;

      setElapsed((prev) => prev + deltaTime);

      const nextDelta =
        smoothDeltaRef.current === 0
          ? deltaTime
          : smoothDeltaRef.current * 0.8 + deltaTime * 0.2;

      smoothDeltaRef.current = nextDelta;
      setDelta(nextDelta);
    },
    { fpsLimit },
  );

  const handleReset = () => {
    stop();
    smoothDeltaRef.current = 0;
    setElapsed(0);
    setDelta(0);
  };

  const handleFpsChange = (idx: number) => {
    smoothDeltaRef.current = 0;
    setFpsIdx(idx);
  };

  const fps = delta > 0 ? Math.min(240, Math.round(1000 / delta)) : 0;
  const angle = (elapsed * 0.09) % 360;
  const canReset = elapsed > 0 || delta > 0;

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

        <div className="relative flex size-32 items-center justify-center rounded-full border border-fd-primary/25 bg-fd-card/70 shadow-2xs backdrop-blur-[2px]">
          <span
            aria-hidden="true"
            className="absolute -top-px left-1/2 h-1.5 w-0.5 -translate-x-1/2 bg-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isActive ? 0.9 : 0.35 }}
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-px left-1/2 h-1.5 w-0.5 -translate-x-1/2 bg-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isActive ? 0.9 : 0.35 }}
          />
          <span
            aria-hidden="true"
            className="absolute top-1/2 -left-px h-0.5 w-1.5 -translate-y-1/2 bg-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isActive ? 0.9 : 0.35 }}
          />
          <span
            aria-hidden="true"
            className="absolute top-1/2 -right-px h-0.5 w-1.5 -translate-y-1/2 bg-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isActive ? 0.9 : 0.35 }}
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 will-change-transform motion-reduce:hidden"
            style={{
              transform: `rotate3d(0, 0, 1, ${angle.toFixed(2)}deg)`,
            }}
          >
            <span className="absolute top-0 left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fd-primary shadow-2xs" />
          </div>

          <div className="flex flex-col items-center gap-0.5 font-mono tabular-nums">
            <div className="flex items-baseline gap-0.5">
              <span className="text-xl font-semibold tracking-tight text-fd-card-foreground">
                {(elapsed / 1000).toFixed(2)}
              </span>
              <span className="text-xs text-fd-muted-foreground">s</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-fd-muted-foreground">
              <span>{isActive ? fps : 0} fps</span>
              <span aria-hidden="true" className="text-fd-border">
                ·
              </span>
              <span>{isActive && delta > 0 ? `${delta.toFixed(1)}ms` : '0.0ms'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1.5 font-mono tabular-nums">
          <button
            type="button"
            onClick={toggle}
            className="inline-flex items-center gap-1.5 rounded-lg bg-fd-primary/10 px-3 py-1 text-[11px] font-semibold text-fd-primary transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15"
          >
            {isActive ? (
              <>
                <Pause className="size-3" />
                Pause
              </>
            ) : (
              <>
                <Play className="size-3" />
                Start
              </>
            )}
          </button>
          <button
            type="button"
            disabled={!canReset}
            onClick={handleReset}
            aria-label="Reset"
            className="inline-flex items-center gap-1 rounded-lg border bg-fd-muted/40 px-2.5 py-1 text-[11px] font-medium text-fd-card-foreground transition-[transform,opacity,background-color] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted"
          >
            <RotateCcw className="size-3" />
            Reset
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-fd-muted-foreground">
            fpsLimit
          </span>
          <div
            role="group"
            aria-label="FPS limit"
            className="relative grid grid-cols-3 rounded-lg border bg-fd-muted/50 p-0.5 font-mono text-[11px] tabular-nums"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/3)] rounded-[6px] bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
              style={{
                transform: `translate3d(${fpsIdx * 100}%, 0, 0)`,
              }}
            />
            {FPS_OPTIONS.map((opt, idx) => {
              const active = idx === fpsIdx;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => handleFpsChange(idx)}
                  className={`relative z-10 rounded-[6px] px-2.5 py-1 text-center font-medium transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
                    active
                      ? 'text-fd-card-foreground'
                      : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-card-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
