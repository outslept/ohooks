'use client';

import { useRef, useState } from 'react';
import { useHotkeys } from '@/hooks/useHotkeys';

const EVENT_OPTIONS = [
  { label: 'keydown', value: 'keydown' },
  { label: 'keyup', value: 'keyup' },
] as const;

type EventMode = (typeof EVENT_OPTIONS)[number]['value'];

const SHORTCUTS = [
  { combo: 'shift+up', label: 'Shift + ↑', delta: '+1', key: 'ArrowUp' },
  { combo: 'shift+down', label: 'Shift + ↓', delta: '-1', key: 'ArrowDown' },
  { combo: 'shift+r', label: 'Shift + R', delta: '0', key: 'r' },
] as const;

export default function UseHotkeysDemo() {
  const [count, setCount] = useState(0);
  const [lastCombo, setLastCombo] = useState<string>('none');
  const [enabled, setEnabled] = useState<boolean>(true);
  const [eventMode, setEventMode] = useState<EventMode>('keydown');
  const frameRef = useRef<HTMLDivElement>(null);

  useHotkeys(
    ['shift+up', 'shift+down', 'shift+r'],
    (_event, combo) => {
      if (combo === 'shift+up') {
        setCount((c) => c + 1);
      } else if (combo === 'shift+down') {
        setCount((c) => c - 1);
      } else {
        setCount(0);
      }
      setLastCombo(combo);

      if (
        frameRef.current &&
        typeof window !== 'undefined' &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        frameRef.current.animate(
          [
            { transform: 'scale3d(1.025, 1.025, 1)' },
            { transform: 'scale3d(1, 1, 1)' },
          ],
          {
            duration: 170,
            easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
          },
        );
      }
    },
    {
      enabled,
      preventDefault: true,
      event: eventMode,
    },
  );

  const triggerCombo = (key: string) => {
    window.dispatchEvent(
      new KeyboardEvent(eventMode, {
        key,
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );
  };

  const activeEventIdx = EVENT_OPTIONS.findIndex((o) => o.value === eventMode);

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

        <div
          ref={frameRef}
          style={{ opacity: enabled ? 1 : 0.55 }}
          className="relative z-10 flex w-full max-w-md flex-col items-center gap-3 border border-fd-primary/25 bg-fd-card/85 px-4 py-3.5 shadow-2xs backdrop-blur-[2px] transition-opacity duration-150 ease-out motion-reduce:transition-none"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: enabled ? 1 : 0.4 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: enabled ? 1 : 0.4 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: enabled ? 1 : 0.4 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: enabled ? 1 : 0.4 }}
          />

          <div className="flex w-full items-center justify-between px-1">
            <span className="font-mono text-[10px] font-semibold tracking-wider text-fd-muted-foreground uppercase">
              matched: <strong className="text-fd-card-foreground">{lastCombo}</strong>
            </span>
            <span className="font-mono text-2xl font-semibold text-fd-card-foreground tabular-nums">
              {count}
            </span>
          </div>

          <div className="grid w-full grid-cols-3 gap-2">
            {SHORTCUTS.map((item) => {
              const isLast = lastCombo === item.combo;
              return (
                <button
                  key={item.combo}
                  type="button"
                  onClick={() => triggerCombo(item.key)}
                  className={`flex flex-col items-center justify-center rounded-md border px-2 py-2 transition-[transform,border-color,background-color,color] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
                    isLast
                      ? 'border-fd-primary/60 bg-fd-primary/10 text-fd-primary'
                      : 'border-fd-border bg-fd-muted/40 text-fd-card-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted/70'
                  }`}
                >
                  <span className="font-mono text-[11px] font-semibold tabular-nums">
                    {item.label}
                  </span>
                  <span className="mt-0.5 font-mono text-[10px] text-fd-muted-foreground tabular-nums">
                    {item.delta}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEnabled((prev) => !prev)}
            className="rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15 motion-reduce:transition-none"
          >
            {enabled ? 'Disable' : 'Enable'}
          </button>
          <span className="font-mono text-[11px] text-fd-muted-foreground tabular-nums">
            enabled: <strong className="text-fd-card-foreground">{String(enabled)}</strong>
          </span>
        </div>

        <div
          role="group"
          aria-label="Keyboard event type"
          className="relative grid grid-cols-2 rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/2)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activeEventIdx * 100}%, 0, 0)`,
            }}
          />
          {EVENT_OPTIONS.map((option) => {
            const active = eventMode === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setEventMode(option.value)}
                className={`relative z-10 rounded-md px-2.5 py-1 font-mono text-[11px] font-medium transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
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
