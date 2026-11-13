'use client';

import { useState } from 'react';
import { useHistoryState } from '@/hooks/useHistoryState';

const CAPACITY_OPTIONS = [
  { label: 'cap 3', value: 3 },
  { label: 'cap 5', value: 5 },
  { label: 'cap 10', value: 10 },
] as const;

export default function UseHistoryStateDemo() {
  const [capacity, setCapacity] = useState<number>(5);
  const [stepCounter, setStepCounter] = useState<number>(2);

  const {
    state,
    set,
    undo,
    redo,
    clear,
    reset,
    canUndo,
    canRedo,
    past,
    future,
  } = useHistoryState<string>('v1: Initial draft', capacity);

  const commitStep = () => {
    const nextVersion = stepCounter;
    setStepCounter((c) => c + 1);
    set(`v${nextVersion}: Snapshot #${nextVersion}`);
  };

  const activeCapIdx = CAPACITY_OPTIONS.findIndex((o) => o.value === capacity);
  const hasHistory = canUndo || canRedo;
  const lastPast = past.length > 0 ? past[past.length - 1] : null;
  const nextFuture = future.length > 0 ? future[0] : null;

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

        <div className="relative z-10 flex w-full max-w-md flex-col gap-2.5 border border-fd-primary/25 bg-fd-card/85 p-3.5 shadow-2xs backdrop-blur-[2px]">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: hasHistory ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: hasHistory ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: hasHistory ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: hasHistory ? 1 : 0.45 }}
          />

          <div className="grid grid-cols-3 gap-2 font-mono text-[11px] tabular-nums">
            <div className="flex flex-col rounded border bg-fd-muted/35 px-2.5 py-1.5">
              <span className="text-[9px] text-fd-muted-foreground uppercase">
                past ({past.length}/{capacity})
              </span>
              <span className="truncate text-fd-muted-foreground">
                {lastPast ?? '—'}
              </span>
            </div>

            <div className="flex flex-col rounded border border-fd-primary/40 bg-fd-primary/10 px-2.5 py-1.5">
              <span className="text-[9px] font-semibold text-fd-primary uppercase">
                present
              </span>
              <span className="truncate font-semibold text-fd-card-foreground">
                {state || 'empty'}
              </span>
            </div>

            <div className="flex flex-col rounded border bg-fd-muted/35 px-2.5 py-1.5">
              <span className="text-[9px] text-fd-muted-foreground uppercase">
                future ({future.length})
              </span>
              <span className="truncate text-fd-muted-foreground">
                {nextFuture ?? '—'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={state}
              onChange={(e) => set(e.target.value)}
              placeholder="Edit present state..."
              aria-label="Present history state"
              className="h-8 min-w-0 flex-1 rounded-md border bg-fd-background px-2.5 text-xs text-fd-card-foreground placeholder:text-fd-muted-foreground focus:border-fd-primary focus:outline-none"
            />
            <button
              type="button"
              onClick={commitStep}
              className="h-8 shrink-0 rounded-md bg-fd-primary/10 px-2.5 font-mono text-[11px] font-semibold text-fd-primary tabular-nums transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15 motion-reduce:transition-none"
            >
              + Step
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            className="rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[background-color,transform,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15 motion-reduce:transition-none"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            className="rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[background-color,transform,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15 motion-reduce:transition-none"
          >
            Redo
          </button>
          <button
            type="button"
            onClick={clear}
            disabled={!hasHistory}
            className="rounded-lg border bg-fd-muted/40 px-2.5 py-1 text-[11px] font-medium text-fd-card-foreground transition-[background-color,transform,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted/70 motion-reduce:transition-none"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => {
              setStepCounter(2);
              reset('v1: Initial draft');
            }}
            className="rounded-lg border bg-fd-muted/40 px-2.5 py-1 text-[11px] font-medium text-fd-card-foreground transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted/70 motion-reduce:transition-none"
          >
            Reset
          </button>
        </div>

        <div
          role="group"
          aria-label="History capacity"
          className="relative grid grid-cols-3 rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/3)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activeCapIdx * 100}%, 0, 0)`,
            }}
          />
          {CAPACITY_OPTIONS.map((option) => {
            const active = capacity === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setCapacity(option.value)}
                className={`relative z-10 rounded-md px-2 py-1 font-mono text-[11px] font-medium tabular-nums transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
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
