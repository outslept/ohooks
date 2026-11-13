'use client';

import { useState } from 'react';
import { Repeat } from 'lucide-react';
import { useToggle } from '@/hooks/useToggle';

const BOOL_OPTIONS = [false, true] as const;

export default function UseToggleDemo() {
  const [value, toggle] = useToggle(false);
  const [lastCall, setLastCall] = useState('defaultValue: false');

  const handleDirectToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    toggle(e);
    setLastCall('onClick={toggle}');
  };

  const handleExplicitToggle = (next: boolean) => {
    toggle(next);
    setLastCall(`toggle(${String(next)})`);
  };

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

        <div
          aria-hidden="true"
          className="pointer-events-none absolute size-40 rounded-full bg-fd-primary/10 blur-2xl transition-opacity duration-200 ease-out motion-reduce:transition-none"
          style={{ opacity: value ? 1 : 0 }}
        />

        <div
          className="relative flex h-24 w-60 items-center justify-center border border-fd-primary/25 bg-fd-card/70 shadow-2xs backdrop-blur-[2px] transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
          style={{
            transform: value ? 'scale(1)' : 'scale(0.98)',
          }}
        >
          <span
            aria-hidden="true"
            className="absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: value ? 1 : 0.35 }}
          />
          <span
            aria-hidden="true"
            className="absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: value ? 1 : 0.35 }}
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: value ? 1 : 0.35 }}
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-px -right-px size-2 border-b-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: value ? 1 : 0.35 }}
          />

          <div
            key={String(value)}
            className="animate-in fade-in zoom-in-95 flex flex-col items-center gap-1 px-3 font-mono tabular-nums duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:animate-none"
          >
            <span className="text-2xl font-semibold tracking-tight text-fd-card-foreground">
              {String(value)}
            </span>
            <span className="text-[11px] text-fd-muted-foreground">
              {lastCall}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <button
          type="button"
          onClick={handleDirectToggle}
          className="inline-flex items-center gap-1.5 rounded-lg bg-fd-primary/10 px-3 py-1 font-mono text-[11px] font-semibold text-fd-primary transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15"
        >
          <Repeat className="size-3" />
          toggle()
        </button>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-fd-muted-foreground">
            explicit
          </span>
          <div
            role="group"
            aria-label="Explicit boolean value"
            className="relative grid grid-cols-2 rounded-lg border bg-fd-muted/50 p-0.5 font-mono text-[11px] tabular-nums"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/2)] rounded-[6px] bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
              style={{
                transform: `translate3d(${value ? 100 : 0}%, 0, 0)`,
              }}
            />
            {BOOL_OPTIONS.map((opt) => {
              const active = value === opt;
              return (
                <button
                  key={String(opt)}
                  type="button"
                  onClick={() => handleExplicitToggle(opt)}
                  className={`relative z-10 rounded-[6px] px-2.5 py-1 text-center font-medium transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
                    active
                      ? 'text-fd-card-foreground'
                      : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-card-foreground'
                  }`}
                >
                  {String(opt)}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
