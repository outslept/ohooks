'use client';

import { useRef, useState } from 'react';
import { Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useMap } from '@/hooks/useMap';

const KEYS = ['cache', 'retry', 'timeout', 'workers'] as const;
type ConfigKey = (typeof KEYS)[number];

const INITIAL_ENTRIES: ReadonlyArray<readonly [ConfigKey, number]> = [
  ['cache', 12],
  ['retry', 3],
  ['workers', 4],
];

export default function UseMapDemo() {
  const [map, { set, remove, clear, reset, get, has }] =
    useMap<ConfigKey, number>(INITIAL_ENTRIES);
  const [activeKey, setActiveKey] = useState<ConfigKey>('cache');
  const frameRef = useRef<HTMLDivElement>(null);

  const pulseFrame = () => {
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

  const incrementKey = (key: ConfigKey) => {
    const current = get(key) ?? 0;
    set(key, current + 1);
    setActiveKey(key);
    pulseFrame();
  };

  const toggleKeyPresence = (key: ConfigKey) => {
    if (has(key)) {
      remove(key);
    } else {
      set(key, 1);
    }
    setActiveKey(key);
    pulseFrame();
  };

  const activeKeyIndex = KEYS.indexOf(activeKey);
  const activeVal = get(activeKey);

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border bg-fd-card p-4 text-fd-card-foreground shadow-xs">
      <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-lg border bg-fd-muted/30 px-3">
        <div
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        <div
          ref={frameRef}
          className="relative flex w-full max-w-xs flex-col justify-center gap-2 border border-fd-primary/25 bg-fd-card/70 px-3.5 py-3 shadow-2xs backdrop-blur-[2px]"
        >
          <span
            className=" -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: map.size > 0 ? 1 : 0.35 }}
          />
          <span
            className=" -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: map.size > 0 ? 1 : 0.35 }}
          />
          <span
            className=" -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: map.size > 0 ? 1 : 0.35 }}
          />
          <span
            className=" -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: map.size > 0 ? 1 : 0.35 }}
          />

          <div className="flex w-full items-center justify-between border-b border-fd-border/60 pb-1.5 font-mono text-[11px] tabular-nums">
            <span className="text-fd-muted-foreground">
              size: <strong className="text-fd-foreground">{map.size}</strong>/4
            </span>
            <span className="text-fd-muted-foreground">
              get(&quot;{activeKey}&quot;):{' '}
              <strong className="text-fd-primary">
                {activeVal !== undefined ? activeVal : 'undefined'}
              </strong>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {KEYS.map((key) => {
              const present = has(key);
              const val = get(key);
              const isFocused = activeKey === key;

              return (
                <div
                  key={key}
                  className={`flex items-center justify-between rounded-md border px-2 py-1 font-mono text-[11px] tabular-nums transition-colors duration-150 ${
                    present
                      ? isFocused
                        ? 'border-fd-primary/45 bg-fd-primary/10 text-fd-foreground'
                        : 'border-fd-border bg-fd-card/80 text-fd-foreground'
                      : 'border-dashed border-fd-border/60 bg-fd-muted/20 text-fd-muted-foreground/60'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => incrementKey(key)}
                    className="truncate text-left transition-transform duration-150 ease-out active:scale-[0.97]"
                  >
                    <span>{key}: </span>
                    <strong
                      className={
                        present ? 'text-fd-primary' : 'text-fd-muted-foreground/50'
                      }
                    >
                      {val ?? '—'}
                    </strong>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleKeyPresence(key)}
                    aria-label={present ? `Remove ${key}` : `Set ${key}`}
                    className="ml-1.5 inline-flex size-4 shrink-0 items-center justify-center rounded-xs text-fd-muted-foreground transition-[color,transform] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-foreground"
                  >
                    {present ? '×' : '+'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => incrementKey(activeKey)}
            className="inline-flex items-center gap-1 rounded-lg bg-fd-primary/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-fd-primary tabular-nums transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15"
          >
            <Plus className="size-3.5" />
            {activeKey}
          </button>
          <button
            type="button"
            onClick={() => {
              reset();
              pulseFrame();
            }}
            aria-label="Reset map"
            className="inline-flex items-center gap-1 rounded-lg border bg-fd-muted/40 px-2 py-1 text-[11px] font-medium text-fd-card-foreground transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted"
          >
            <RotateCcw className="size-3 text-fd-muted-foreground" />
            Reset
          </button>
          <button
            type="button"
            onClick={() => {
              clear();
              pulseFrame();
            }}
            disabled={map.size === 0}
            aria-label="Clear map"
            className="inline-flex items-center gap-1 rounded-lg border bg-fd-muted/40 px-2 py-1 text-[11px] font-medium text-fd-card-foreground transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted"
          >
            <Trash2 className="size-3 text-fd-muted-foreground" />
            Clear
          </button>
        </div>

        <div
          role="group"
          aria-label="Active map key"
          className="relative grid grid-cols-4 items-center rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-0.25rem)/4)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activeKeyIndex * 100}%, 0, 0)`,
            }}
          />
          {KEYS.map((key) => {
            const isSelected = activeKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveKey(key)}
                className={`relative z-10 px-1.5 py-0.5 font-mono text-[11px] font-medium transition-[color,transform] duration-150 ease-out active:scale-[0.97] ${
                  isSelected
                    ? 'text-fd-foreground'
                    : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-foreground'
                }`}
              >
                {key}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
