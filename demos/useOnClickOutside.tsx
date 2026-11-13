'use client';

import { useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

const MODES = [
  { id: 'pointerdown', label: 'pointerdown' },
  { id: 'mouseup', label: 'mouseup' },
  { id: 'off', label: 'off' },
] as const;

type ModeId = (typeof MODES)[number]['id'];

export default function UseOnClickOutsideDemo() {
  const boxRef = useRef<HTMLButtonElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<ModeId>('pointerdown');
  const [insideClicks, setInsideClicks] = useState(0);
  const [outsideClicks, setOutsideClicks] = useState(0);
  const [lastHit, setLastHit] = useState<'inside' | 'outside' | 'idle'>('idle');

  const animateFrame = (type: 'inside' | 'outside') => {
    if (
      typeof window === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    boxRef.current?.animate(
      type === 'inside'
        ? [
            { transform: 'scale3d(0.96, 0.96, 1)' },
            { transform: 'scale3d(1, 1, 1)' },
          ]
        : [
            { transform: 'translate3d(-3px, 0, 0)' },
            { transform: 'translate3d(3px, 0, 0)' },
            { transform: 'translate3d(0, 0, 0)' },
          ],
      { duration: 180, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }
    );
  };

  useOnClickOutside(
    [boxRef, controlsRef],
    () => {
      setOutsideClicks((count) => count + 1);
      setLastHit('outside');
      animateFrame('outside');
    },
    {
      enabled: mode !== 'off',
      events: mode === 'mouseup' ? ['mouseup'] : ['pointerdown'],
    }
  );

  const handleInsideClick = () => {
    setInsideClicks((count) => count + 1);
    setLastHit('inside');
    animateFrame('inside');
  };

  const resetCounters = () => {
    setInsideClicks(0);
    setOutsideClicks(0);
    setLastHit('idle');
  };

  const activeModeIndex = MODES.findIndex((item) => item.id === mode);

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border bg-fd-card p-4 text-fd-card-foreground shadow-xs">
      <div className="relative flex h-44 w-full cursor-crosshair items-center justify-center overflow-hidden rounded-lg border bg-fd-muted/30 select-none">
        <div
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        <button
          ref={boxRef}
          type="button"
          onClick={handleInsideClick}
          className="relative flex w-60 cursor-pointer flex-col items-center justify-center gap-2 border border-fd-primary/25 bg-fd-card/70 px-5 py-3.5 text-center shadow-2xs backdrop-blur-[2px] transition-[transform,border-color,background-color] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:border-fd-primary/45 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-card/90"
        >
          <span
            className=" -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: lastHit === 'outside' ? 1 : 0.45 }}
          />
          <span
            className=" -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: lastHit === 'outside' ? 1 : 0.45 }}
          />
          <span
            className=" -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: lastHit === 'outside' ? 1 : 0.45 }}
          />
          <span
            className=" -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: lastHit === 'outside' ? 1 : 0.45 }}
          />

          <div className="flex items-center gap-1.5 text-[10px] font-medium tracking-wider text-fd-muted-foreground uppercase">
            <span
              className={`size-1.5 rounded-full transition-colors duration-150 ${
                lastHit === 'outside'
                  ? 'bg-fd-primary'
                  : lastHit === 'inside'
                    ? 'bg-emerald-500'
                    : 'bg-fd-muted-foreground/50'
              }`}
            />
            <span>
              {lastHit === 'outside'
                ? 'Outside hit'
                : lastHit === 'inside'
                  ? 'Inside target'
                  : 'Target boundary'}
            </span>
          </div>

          <div className="flex items-baseline gap-4 font-mono text-xl font-bold tracking-tight text-fd-foreground tabular-nums">
            <span>
              <span className="mr-1.5 text-xs font-normal text-fd-muted-foreground">
                out
              </span>
              {outsideClicks}
            </span>
            <span className="text-fd-border">/</span>
            <span>
              <span className="mr-1.5 text-xs font-normal text-fd-muted-foreground">
                in
              </span>
              {insideClicks}
            </span>
          </div>
        </button>
      </div>

      <div
        ref={controlsRef}
        className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs"
      >
        <button
          type="button"
          onClick={resetCounters}
          className="inline-flex items-center gap-1.5 rounded-lg border bg-fd-muted/40 px-2.5 py-1 text-[11px] font-medium text-fd-card-foreground transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted"
        >
          <RotateCcw className="size-3 text-fd-muted-foreground" />
          Reset
        </button>

        <div
          role="group"
          aria-label="Outside click event mode"
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
                onClick={() => setMode(item.id)}
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
