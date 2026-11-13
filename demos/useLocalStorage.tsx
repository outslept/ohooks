'use client';

import { useEffect, useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const STORAGE_KEY = 'demo-local-username';

const PRESETS = [
  { id: 'Ada Lovelace', label: 'Ada' },
  { id: 'Grace Hopper', label: 'Grace' },
  { id: 'Alan Turing', label: 'Alan' },
] as const;

function MirroredSubscriber() {
  const [mirrored] = useLocalStorage(STORAGE_KEY, 'Ada Lovelace', {
    initializeWithValue: false,
  });

  return (
    <span className="truncate text-fd-foreground">
      mirror: &quot;{mirrored}&quot;
    </span>
  );
}

export default function UseLocalStorageDemo() {
  const [username, setUsername, removeUsername] = useLocalStorage(
    STORAGE_KEY,
    'Ada Lovelace',
    { initializeWithValue: false }
  );
  const [rawBytes, setRawBytes] = useState<number | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        setRawBytes(raw !== null ? new Blob([raw]).size : null);
      } catch {
        setRawBytes(null);
      }
    }

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

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
  }, [username]);

  const handleRemove = () => {
    removeUsername();
    setRawBytes(null);

    if (
      typeof window !== 'undefined' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      frameRef.current?.animate(
        [
          { transform: 'scale3d(0.97, 0.97, 1)', opacity: 0.75 },
          { transform: 'scale3d(1, 1, 1)', opacity: 1 },
        ],
        { duration: 180, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }
      );
    }
  };

  const isPersisted = rawBytes !== null;
  const activePresetIndex = PRESETS.findIndex((item) => item.id === username);

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
          className="relative flex w-full max-w-xs flex-col items-center justify-center gap-2.5 border border-fd-primary/25 bg-fd-card/70 px-4 py-3.5 shadow-2xs backdrop-blur-[2px]"
        >
          <span
            className=" -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: isPersisted ? 1 : 0.35 }}
          />
          <span
            className=" -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: isPersisted ? 1 : 0.35 }}
          />
          <span
            className=" -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: isPersisted ? 1 : 0.35 }}
          />
          <span
            className=" -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: isPersisted ? 1 : 0.35 }}
          />

          <div className="flex w-full items-center justify-between font-mono text-[10px] tracking-wider text-fd-muted-foreground uppercase tabular-nums">
            <span className="inline-flex items-center gap-1.5">
              <span
                className={`size-1.5 rounded-full transition-colors duration-150 ${
                  isPersisted ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span>{isPersisted ? 'persisted' : 'fallback'}</span>
            </span>
            <span>{isPersisted ? `${rawBytes} B` : 'null'}</span>
          </div>

          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            aria-label="localStorage value"
            className="w-full rounded-md border border-fd-border bg-fd-muted/40 px-2.5 py-1.5 text-center font-mono text-xs font-semibold text-fd-foreground focus:border-fd-primary focus:outline-none"
          />

          <div className="flex w-full items-center justify-between gap-2 border-t border-fd-border/60 pt-2 font-mono text-[11px] text-fd-muted-foreground tabular-nums">
            <span className="shrink-0">key: {STORAGE_KEY.slice(5)}</span>
            <MirroredSubscriber />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <button
          type="button"
          onClick={handleRemove}
          disabled={!isPersisted}
          className="inline-flex items-center gap-1.5 rounded-lg border bg-fd-muted/40 px-2.5 py-1 text-[11px] font-medium text-fd-card-foreground transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted"
        >
          <Trash2 className="size-3 text-fd-muted-foreground" />
          removeValue()
        </button>

        <div
          role="group"
          aria-label="Preset storage values"
          className="relative grid grid-cols-3 items-center rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-0.25rem)/3)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${Math.max(0, activePresetIndex) * 100}%, 0, 0)`,
              opacity: activePresetIndex === -1 ? 0 : 1,
            }}
          />
          {PRESETS.map((preset) => {
            const isSelected = username === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setUsername(preset.id)}
                className={`relative z-10 px-2.5 py-0.5 font-mono text-[11px] font-medium transition-[color,transform] duration-150 ease-out active:scale-[0.97] ${
                  isSelected
                    ? 'text-fd-foreground'
                    : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-foreground'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
