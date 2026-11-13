'use client';

import { useState } from 'react';
import { useControllableState } from '@/hooks/useControllableState';

type ControlMode = 'controlled' | 'uncontrolled';

const MODES: { value: ControlMode; label: string }[] = [
  { value: 'controlled', label: 'Controlled' },
  { value: 'uncontrolled', label: 'Uncontrolled' },
];

function ControllableCounter({
  value,
  defaultValue,
  onChange,
}: {
  value?: number;
  defaultValue: number;
  onChange?: (next: number) => void;
}) {
  const [count, setCount, isControlled] = useControllableState<number>({
    value,
    defaultValue,
    onChange,
  });

  return (
    <div className="relative flex w-60 flex-col items-center justify-center gap-2.5 border border-fd-primary/30 bg-fd-card/85 px-4 py-3.5 shadow-2xs backdrop-blur-[2px] animate-in fade-in zoom-in-95 duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:animate-none">
      <span
        className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out"
        style={{ opacity: isControlled ? 1 : 0.45 }}
      />
      <span
        className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out"
        style={{ opacity: isControlled ? 1 : 0.45 }}
      />
      <span
        className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out"
        style={{ opacity: isControlled ? 1 : 0.45 }}
      />
      <span
        className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out"
        style={{ opacity: isControlled ? 1 : 0.45 }}
      />

      <div className="flex w-full items-center justify-between font-mono text-[10px]">
        <span className="uppercase text-fd-muted-foreground">
          isControlled
        </span>
        <span
          className={`rounded px-1.5 py-0.2 font-semibold ${
            isControlled
              ? 'bg-fd-primary/15 text-fd-primary'
              : 'bg-fd-muted text-fd-muted-foreground'
          }`}
        >
          {String(isControlled)}
        </span>
      </div>

      <div className="flex items-center gap-3 font-mono tabular-nums">
        <button
          type="button"
          onClick={() => setCount((c) => c - 1)}
          aria-label="Decrement child state"
          className="rounded-md border bg-fd-muted/40 px-2.5 py-1 text-xs font-semibold text-fd-foreground transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted/70 motion-reduce:transition-none"
        >
          -1
        </button>

        <span className="min-w-[3ch] text-center text-xl font-semibold tracking-tight text-fd-foreground">
          {count}
        </span>

        <button
          type="button"
          onClick={() => setCount((c) => c + 1)}
          aria-label="Increment child state"
          className="rounded-md bg-fd-primary/10 px-2.5 py-1 text-xs font-semibold text-fd-primary transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/20 motion-reduce:transition-none"
        >
          +1
        </button>
      </div>
    </div>
  );
}

export default function UseControllableStateDemo() {
  const [mode, setMode] = useState<ControlMode>('controlled');
  const [parentValue, setParentValue] = useState(10);

  const activeModeIdx = MODES.findIndex((m) => m.value === mode);

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

        <ControllableCounter
          key={mode}
          value={mode === 'controlled' ? parentValue : undefined}
          defaultValue={parentValue}
          onChange={setParentValue}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1.5 font-mono text-[11px] tabular-nums">
          <span className="text-fd-muted-foreground">
            parent:{' '}
            <strong className="font-semibold text-fd-foreground">
              {parentValue}
            </strong>
          </span>
          <button
            type="button"
            onClick={() => setParentValue((v) => v + 10)}
            className="rounded-lg border bg-fd-muted/40 px-2 py-1 font-medium text-fd-card-foreground transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted/70 motion-reduce:transition-none"
          >
            Parent +10
          </button>
        </div>

        <div
          role="group"
          aria-label="Control mode"
          className="relative grid grid-cols-2 rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/2)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activeModeIdx * 100}%, 0, 0)`,
            }}
          />
          {MODES.map((option) => {
            const active = mode === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setMode(option.value)}
                className={`relative z-10 rounded-md px-2 py-0.5 font-mono text-[11px] font-medium transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
                  active
                    ? 'text-fd-foreground'
                    : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-foreground'
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
