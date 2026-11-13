'use client';

import { useState } from 'react';
import { useCounter } from '@/hooks/useCounter';

const MIN = 0;
const MAX = 10;
const INITIAL = 5;
const STEPS = [1, 3] as const;

export default function UseCounterDemo() {
  const [step, setStep] = useState<(typeof STEPS)[number]>(1);
  const { count, inc, dec, set, reset } = useCounter(INITIAL, {
    min: MIN,
    max: MAX,
  });

  const progress = (count - MIN) / (MAX - MIN);
  const atEdge = count <= MIN || count >= MAX;
  const activeStepIdx = STEPS.indexOf(step);

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border bg-fd-card p-4 text-fd-card-foreground shadow-xs">
      <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-lg border bg-fd-muted/30">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        <div className="relative flex w-60 flex-col gap-2.5 border border-fd-primary/25 bg-fd-card/85 px-4 py-3 shadow-2xs backdrop-blur-[2px]">
          <span
            className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: atEdge ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: atEdge ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: atEdge ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: atEdge ? 1 : 0.45 }}
          />

          <div className="flex items-center justify-between font-mono text-[10px] tabular-nums text-fd-muted-foreground">
            <span>
              range: [{MIN}, {MAX}]
            </span>
            <span
              className={`rounded px-1.5 py-0.2 font-semibold uppercase transition-colors duration-150 ease-out ${
                atEdge
                  ? 'bg-fd-primary/15 text-fd-primary'
                  : 'bg-fd-muted text-fd-muted-foreground'
              }`}
            >
              {count <= MIN ? 'Min' : count >= MAX ? 'Max' : 'Clamped'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 font-mono tabular-nums">
            <button
              type="button"
              onClick={() => dec(step)}
              disabled={count <= MIN}
              aria-label={`Decrement by ${step}`}
              className="rounded-md border bg-fd-muted/40 px-2.5 py-1 text-xs font-semibold text-fd-foreground transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted/70 motion-reduce:transition-none"
            >
              -{step}
            </button>

            <output className="text-2xl font-semibold tracking-tight text-fd-foreground">
              {count}
            </output>

            <button
              type="button"
              onClick={() => inc(step)}
              disabled={count >= MAX}
              aria-label={`Increment by ${step}`}
              className="rounded-md bg-fd-primary/10 px-2.5 py-1 text-xs font-semibold text-fd-primary transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/20 motion-reduce:transition-none"
            >
              +{step}
            </button>
          </div>

          <div className="h-1 w-full overflow-hidden rounded-full bg-fd-muted">
            <div
              className="h-full w-full origin-left bg-fd-primary transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
              style={{
                transform: `scale3d(${progress}, 1, 1)`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1.5 font-mono text-[11px] tabular-nums">
          <button
            type="button"
            onClick={() => set(MIN)}
            disabled={count === MIN}
            className="rounded-lg border bg-fd-muted/40 px-2.5 py-1 font-medium text-fd-card-foreground transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted/70 motion-reduce:transition-none"
          >
            Min ({MIN})
          </button>
          <button
            type="button"
            onClick={() => set(MAX)}
            disabled={count === MAX}
            className="rounded-lg border bg-fd-muted/40 px-2.5 py-1 font-medium text-fd-card-foreground transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted/70 motion-reduce:transition-none"
          >
            Max ({MAX})
          </button>
          <button
            type="button"
            onClick={reset}
            disabled={count === INITIAL}
            className="rounded-lg border bg-fd-muted/40 px-2.5 py-1 font-medium text-fd-muted-foreground transition-[transform,background-color,color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted/70 [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-foreground motion-reduce:transition-none"
          >
            Reset ({INITIAL})
          </button>
        </div>

        <div
          role="group"
          aria-label="Step delta"
          className="relative grid grid-cols-2 rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/2)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activeStepIdx * 100}%, 0, 0)`,
            }}
          />
          {STEPS.map((s) => {
            const active = step === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStep(s)}
                className={`relative z-10 rounded-md px-2 py-0.5 font-mono text-[11px] font-medium tabular-nums transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
                  active
                    ? 'text-fd-foreground'
                    : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-foreground'
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
