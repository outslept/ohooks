'use client';

import { ArrowRight, Minus, Plus, RotateCcw } from 'lucide-react';
import { useRef, useState } from 'react';
import { usePrevious } from '@/hooks/usePrevious';

const STEP_OPTIONS = [1, 5, 10] as const;

export default function UsePreviousDemo() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState<(typeof STEP_OPTIONS)[number]>(1);
  const frameRef = useRef<HTMLDivElement>(null);

  const prevCount = usePrevious(count);

  const pulseFrame = () => {
    const el = frameRef.current;
    if (!el) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    el.animate(
      [
        { transform: 'scale3d(1.02, 1.02, 1)' },
        { transform: 'scale3d(1, 1, 1)' },
      ],
      { duration: 200, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }
    );
  };

  const updateCount = (next: number) => {
    if (next === count) return;
    setCount(next);
    pulseFrame();
  };

  const delta = prevCount !== undefined ? count - prevCount : null;
  const directionLabel =
    delta === null
      ? 'initial render'
      : delta > 0
        ? 'incremented'
        : delta < 0
          ? 'decremented'
          : 'unchanged';

  const stepIndex = STEP_OPTIONS.indexOf(step);

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
          className="relative flex w-72 max-w-[calc(100%-1.5rem)] flex-col gap-2.5 border border-fd-primary/25 bg-fd-card/70 p-3.5 shadow-2xs backdrop-blur-[2px]"
        >
          <span
            className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: prevCount !== undefined ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: prevCount !== undefined ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: prevCount !== undefined ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: prevCount !== undefined ? 1 : 0.45 }}
          />

          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-wider uppercase text-fd-muted-foreground">
              <span
                className={`size-1.5 rounded-full transition-colors duration-150 ease-out ${
                  prevCount !== undefined
                    ? 'bg-fd-primary'
                    : 'bg-fd-muted-foreground/40'
                }`}
              />
              {directionLabel}
            </span>
            <span className="font-mono text-[10px] tabular-nums text-fd-muted-foreground">
              Δ:{' '}
              <strong className="text-fd-primary">
                {delta === null ? '—' : delta > 0 ? `+${delta}` : delta}
              </strong>
            </span>
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-y border-fd-border/60 py-2.5">
            <div className="flex flex-col">
              <span className="text-[10px] font-medium tracking-wider uppercase text-fd-muted-foreground">
                Previous
              </span>
              <span className="font-mono text-2xl font-bold tabular-nums text-fd-card-foreground">
                {prevCount ?? 'undefined'}
              </span>
            </div>

            <ArrowRight className="size-3.5 text-fd-muted-foreground" />

            <div className="flex flex-col items-end">
              <span className="text-[10px] font-medium tracking-wider uppercase text-fd-primary">
                Current
              </span>
              <span className="font-mono text-2xl font-bold tabular-nums text-fd-primary">
                {count}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between font-mono text-[10px] tabular-nums text-fd-muted-foreground">
            <span>ref.current: {String(prevCount)}</span>
            <span>step ±{step}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => updateCount(count + step)}
            className="inline-flex items-center gap-1 rounded-lg bg-fd-primary/10 px-2.5 py-1 font-mono text-[11px] font-semibold tabular-nums text-fd-primary transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15"
          >
            <Plus className="size-3" />
            Add {step}
          </button>

          <button
            type="button"
            onClick={() => updateCount(count - step)}
            className="inline-flex items-center gap-1 rounded-lg border bg-fd-muted/40 px-2.5 py-1 font-mono text-[11px] font-medium tabular-nums text-fd-card-foreground transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted"
          >
            <Minus className="size-3" />
            Sub {step}
          </button>

          <button
            type="button"
            onClick={() => updateCount(0)}
            disabled={count === 0}
            aria-label="Reset count to zero"
            className="inline-flex size-6 items-center justify-center rounded-lg border bg-fd-muted/40 text-fd-muted-foreground transition-[transform,color,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-card-foreground"
          >
            <RotateCcw className="size-3" />
          </button>
        </div>

        <div
          role="group"
          aria-label="Step increment size"
          className="relative grid grid-cols-3 rounded-lg border bg-fd-muted/50 p-0.5"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/3)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${stepIndex * 100}%, 0, 0)`,
            }}
          />
          {STEP_OPTIONS.map((s) => {
            const active = step === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStep(s)}
                className={`relative z-10 rounded-md px-2 py-0.5 font-mono text-[11px] font-medium tabular-nums transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
                  active
                    ? 'text-fd-card-foreground'
                    : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-card-foreground'
                }`}
              >
                ±{s}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
