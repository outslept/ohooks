'use client';

import { Check, Minus, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useSet } from '@/hooks/useSet';

const TOPICS = [
  'TypeScript',
  'React 19',
  'SSR',
  'Tailwind',
  'Signals',
  'WASM',
] as const;

const PROBE_KEYS = ['TypeScript', 'SSR', 'WASM'] as const;

export default function UseSetDemo() {
  const [set, { add, remove, toggle, clear, reset, has }] = useSet<string>([
    'TypeScript',
    'React 19',
  ]);
  const [probe, setProbe] = useState<(typeof PROBE_KEYS)[number]>('TypeScript');

  const items = Array.from(set);
  const nextToAdd = TOPICS.find((t) => !has(t));
  const lastAdded = items[items.length - 1];
  const probeExists = has(probe);
  const probeIndex = PROBE_KEYS.indexOf(probe);

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

        <div className="relative flex w-80 max-w-[calc(100%-1.5rem)] flex-col gap-2.5 border border-fd-primary/25 bg-fd-card/70 p-3.5 shadow-2xs backdrop-blur-[2px]">
          <span
            className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: set.size > 0 ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: set.size > 0 ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: set.size > 0 ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: set.size > 0 ? 1 : 0.45 }}
          />

          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-wider uppercase text-fd-muted-foreground">
              <span
                className={`size-1.5 rounded-full transition-colors duration-150 ease-out ${
                   probeExists ? 'bg-fd-primary' : 'bg-fd-muted-foreground/40'
                }`}
              />
              has(&quot;{probe}&quot;) →{' '}
              <strong
                className={
                  probeExists ? 'text-fd-primary' : 'text-fd-muted-foreground'
                }
              >
                {String(probeExists)}
              </strong>
            </span>
            <span className="font-mono text-[10px] tabular-nums text-fd-muted-foreground">
              size: <strong className="text-fd-card-foreground">{set.size}</strong>/{TOPICS.length}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 border-y border-fd-border/60 py-2">
            {TOPICS.map((topic) => {
              const active = has(topic);
              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => toggle(topic)}
                  className={`inline-flex items-center justify-center gap-1 rounded-md border px-2 py-1 font-mono text-[11px] font-medium transition-[transform,color,background-color,border-color] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
                    active
                      ? 'border-fd-primary/40 bg-fd-primary/15 text-fd-primary'
                      : 'border-fd-border/70 bg-fd-background/60 text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-card-foreground'
                  }`}
                >
                  {active ? (
                    <Check className="size-2.5 shrink-0" />
                  ) : (
                    <Plus className="size-2.5 shrink-0 opacity-60" />
                  )}
                  <span className="truncate">{topic}</span>
                </button>
              );
            })}
          </div>

          <div className="truncate font-mono text-[10px] tabular-nums text-fd-muted-foreground">
            {items.length > 0
              ? `Set(${set.size}) { ${items.map((item) => `"${item}"`).join(', ')} }`
              : 'Set(0) {}'}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              if (nextToAdd) add(nextToAdd);
            }}
            disabled={!nextToAdd}
            className="inline-flex items-center gap-1 rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15"
          >
            <Plus className="size-3" />
            Add
          </button>

          <button
            type="button"
            onClick={() => {
              if (lastAdded) remove(lastAdded);
            }}
            disabled={!lastAdded}
            className="inline-flex items-center gap-1 rounded-lg border bg-fd-muted/40 px-2.5 py-1 text-[11px] font-medium text-fd-card-foreground transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted"
          >
            <Minus className="size-3" />
            Remove
          </button>

          <button
            type="button"
            onClick={reset}
            aria-label="Reset set to initial values"
            className="inline-flex size-6 items-center justify-center rounded-lg border bg-fd-muted/40 text-fd-muted-foreground transition-[transform,color,background-color] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-card-foreground"
          >
            <RotateCcw className="size-3" />
          </button>

          <button
            type="button"
            onClick={clear}
            disabled={set.size === 0}
            aria-label="Clear all set values"
            className="inline-flex size-6 items-center justify-center rounded-lg border bg-fd-muted/40 text-fd-muted-foreground transition-[transform,color,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-card-foreground"
          >
            <Trash2 className="size-3" />
          </button>
        </div>

        <div
          role="group"
          aria-label="Inspect set key with has()"
          className="relative grid grid-cols-3 rounded-lg border bg-fd-muted/50 p-0.5"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/3)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${probeIndex * 100}%, 0, 0)`,
            }}
          />
          {PROBE_KEYS.map((key) => {
            const active = probe === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setProbe(key)}
                className={`relative z-10 rounded-md px-2 py-0.5 font-mono text-[11px] font-medium transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
                  active
                    ? 'text-fd-card-foreground'
                    : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-card-foreground'
                }`}
              >
                {key === 'TypeScript' ? 'TS' : key}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
