'use client';

import { useState } from 'react';
import { useKeyPress } from '@/hooks/useKeyPress';

const PREVENT_OPTIONS = [
  { label: 'preventDefault', value: true },
  { label: 'default', value: false },
] as const;

export default function UseKeyPressDemo() {
  const [preventDefault, setPreventDefault] = useState<boolean>(true);

  const isShift = useKeyPress('shift');
  const isEnter = useKeyPress('Enter', { preventDefault });
  const isUp = useKeyPress(['ArrowUp', 'w'], { preventDefault });

  const keys = [
    { id: 'shift', label: 'Shift', sub: 'shift', eventKey: 'Shift', active: isShift },
    { id: 'enter', label: 'Enter ↵', sub: 'Enter', eventKey: 'Enter', active: isEnter },
    { id: 'up', label: '↑ / W', sub: 'ArrowUp, w', eventKey: 'ArrowUp', active: isUp },
  ];

  const activeCount = Number(isShift) + Number(isEnter) + Number(isUp);
  const anyActive = activeCount > 0;
  const activePreventIdx = preventDefault ? 0 : 1;

  const dispatchKey = (type: 'keydown' | 'keyup', key: string) => {
    window.dispatchEvent(
      new KeyboardEvent(type, {
        key,
        shiftKey: key === 'Shift' ? type === 'keydown' : isShift,
        bubbles: true,
        cancelable: true,
      }),
    );
  };

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

        <div className="relative z-10 flex w-full max-w-md flex-col gap-2.5 border border-fd-primary/25 bg-fd-card/80 p-3.5 shadow-2xs backdrop-blur-[2px]">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: anyActive ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: anyActive ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: anyActive ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: anyActive ? 1 : 0.45 }}
          />

          <div className="grid grid-cols-3 gap-2.5">
            {keys.map((k) => (
              <button
                key={k.id}
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  dispatchKey('keydown', k.eventKey);
                }}
                onPointerUp={() => dispatchKey('keyup', k.eventKey)}
                onPointerLeave={() => {
                  if (k.active) {
                    dispatchKey('keyup', k.eventKey);
                  }
                }}
                onPointerCancel={() => dispatchKey('keyup', k.eventKey)}
                style={{
                  transform: k.active
                    ? 'translate3d(0, 2px, 0) scale3d(0.97, 0.97, 1)'
                    : 'translate3d(0, 0, 0) scale3d(1, 1, 1)',
                }}
                className={`flex select-none flex-col items-center justify-center rounded-md border px-2 py-3 transition-[transform,border-color,background-color,color] duration-150 ease-out motion-reduce:transition-none ${
                  k.active
                    ? 'border-fd-primary bg-fd-primary/15 text-fd-primary'
                    : 'border-fd-border bg-fd-muted/40 text-fd-card-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted/70'
                }`}
              >
                <span className="font-mono text-xs font-semibold tabular-nums">
                  {k.label}
                </span>
                <span className="mt-1 font-mono text-[10px] text-fd-muted-foreground tabular-nums">
                  {k.active ? 'pressed' : k.sub}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`size-2 rounded-full transition-colors duration-150 ease-out ${
              anyActive ? 'bg-fd-primary' : 'bg-fd-muted-foreground/40'
            }`}
          />
          <span className="font-mono text-[11px] font-medium text-fd-muted-foreground tabular-nums">
            {anyActive ? `${activeCount} held` : 'idle'}
          </span>
        </div>

        <div
          role="group"
          aria-label="Prevent default behavior"
          className="relative grid grid-cols-2 rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/2)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activePreventIdx * 100}%, 0, 0)`,
            }}
          />
          {PREVENT_OPTIONS.map((option) => {
            const active = preventDefault === option.value;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => setPreventDefault(option.value)}
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
