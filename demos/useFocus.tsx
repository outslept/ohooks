'use client';

import { useRef, useState } from 'react';
import { useFocus } from '@/hooks/useFocus';

const FOCUS_OPTIONS = [
  { label: 'all focus', focusVisible: false },
  { label: ':focus-visible', focusVisible: true },
] as const;

export default function UseFocusDemo() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focusVisible, setFocusVisible] = useState<boolean>(false);
  const [focusCount, setFocusCount] = useState<number>(0);

  const { isFocused, focus, blur } = useFocus(inputRef, {
    focusVisible,
    onFocus: () => setFocusCount((c) => c + 1),
  });

  const activeModeIdx = focusVisible ? 1 : 0;

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
          style={{
            transform: isFocused
              ? 'scale3d(1.02, 1.02, 1)'
              : 'scale3d(1, 1, 1)',
          }}
          className={`relative z-10 flex w-full max-w-sm flex-col gap-2.5 border p-3.5 shadow-2xs backdrop-blur-[2px] transition-[transform,border-color,background-color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none ${
            isFocused
              ? 'border-fd-primary/60 bg-fd-card/95'
              : 'border-fd-primary/25 bg-fd-card/80'
          }`}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isFocused ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isFocused ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isFocused ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isFocused ? 1 : 0.45 }}
          />

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span
                className={`size-2 rounded-full transition-colors duration-150 ease-out ${
                  isFocused ? 'bg-fd-primary' : 'bg-fd-muted-foreground/40'
                }`}
              />
              <span className="font-mono text-[10px] font-semibold tracking-wider text-fd-card-foreground uppercase">
                {isFocused ? 'focused' : 'blurred'}
              </span>
            </div>

            <span className="font-mono text-[10px] text-fd-muted-foreground tabular-nums">
              isFocused: <strong className="text-fd-card-foreground">{String(isFocused)}</strong>
            </span>
          </div>

          <input
            ref={inputRef}
            type="text"
            defaultValue="Focusable input target"
            aria-label="Focus target input"
            className="h-8 w-full rounded-md border bg-fd-background px-2.5 text-xs text-fd-card-foreground focus:border-fd-primary focus:ring-1 focus:ring-fd-primary focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => focus()}
            disabled={isFocused}
            className="rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[background-color,transform,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15 motion-reduce:transition-none"
          >
            focus()
          </button>
          <button
            type="button"
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => blur()}
            disabled={!isFocused}
            className="rounded-lg border bg-fd-muted/40 px-2.5 py-1 text-[11px] font-medium text-fd-card-foreground transition-[background-color,transform,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted/70 motion-reduce:transition-none"
          >
            blur()
          </button>
          <span className="ml-1 font-mono text-[11px] text-fd-muted-foreground tabular-nums">
            events: <strong className="text-fd-card-foreground">{focusCount}</strong>
          </span>
        </div>

        <div
          role="group"
          aria-label="Focus visible option"
          className="relative grid grid-cols-2 rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/2)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activeModeIdx * 100}%, 0, 0)`,
            }}
          />
          {FOCUS_OPTIONS.map((option) => {
            const active = focusVisible === option.focusVisible;
            return (
              <button
                key={option.label}
                type="button"
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => setFocusVisible(option.focusVisible)}
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
