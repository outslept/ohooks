'use client';

import { useRef, useState } from 'react';
import { useFocusTrap } from '@/hooks/useFocusTrap';

const INITIAL_OPTIONS = [
  { label: 'init #1', selector: '[data-focus="1"]' },
  { label: 'init #2', selector: '[data-focus="2"]' },
] as const;

export default function UseFocusTrapDemo() {
  const [trapped, setTrapped] = useState(false);
  const [initIdx, setInitIdx] = useState(0);
  const [focusedSlot, setFocusedSlot] = useState<string>('none');
  const trapRef = useRef<HTMLDivElement>(null);

  useFocusTrap(trapRef, {
    enabled: trapped,
    initialFocus: INITIAL_OPTIONS[initIdx].selector,
    restoreFocus: true,
    onEscape: () => setTrapped(false),
  });

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
          ref={trapRef}
          onFocusCapture={(e) => {
            const slot = (e.target as HTMLElement).getAttribute('data-focus');
            if (slot) setFocusedSlot(`#${slot}`);
          }}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
              setFocusedSlot('none');
            }
          }}
          style={{
            transform: trapped
              ? 'scale3d(1.015, 1.015, 1)'
              : 'scale3d(1, 1, 1)',
          }}
          className={`relative z-10 flex w-full max-w-md flex-col gap-2.5 border p-3.5 shadow-2xs backdrop-blur-[2px] transition-[transform,border-color,background-color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none ${
            trapped
              ? 'border-fd-primary/60 bg-fd-card/95'
              : 'border-fd-primary/25 bg-fd-card/80'
          }`}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: trapped ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: trapped ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: trapped ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: trapped ? 1 : 0.45 }}
          />

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span
                className={`size-2 rounded-full transition-colors duration-150 ease-out ${
                  trapped ? 'bg-fd-primary' : 'bg-fd-muted-foreground/40'
                }`}
              />
              <span className="font-mono text-[10px] font-semibold tracking-wider text-fd-card-foreground uppercase">
                {trapped ? 'trapped (Tab / Esc)' : 'unlocked'}
              </span>
            </div>
            <span className="font-mono text-[10px] text-fd-muted-foreground tabular-nums">
              focus: <strong className="text-fd-card-foreground">{focusedSlot}</strong>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              data-focus="1"
              defaultValue="Field #1"
              aria-label="First trapped input"
              className="h-8 min-w-0 rounded-md border bg-fd-background px-2.5 font-mono text-xs text-fd-card-foreground focus:border-fd-primary focus:ring-1 focus:ring-fd-primary focus:outline-none"
            />
            <input
              type="text"
              data-focus="2"
              defaultValue="Field #2"
              aria-label="Second trapped input"
              className="h-8 min-w-0 rounded-md border bg-fd-background px-2.5 font-mono text-xs text-fd-card-foreground focus:border-fd-primary focus:ring-1 focus:ring-fd-primary focus:outline-none"
            />
            <button
              type="button"
              data-focus="3"
              onClick={() => setTrapped(false)}
              disabled={!trapped}
              className="h-8 rounded-md border bg-fd-muted/50 px-2 font-mono text-[11px] font-medium text-fd-card-foreground transition-[background-color,transform,opacity] duration-150 ease-out active:scale-[0.97] focus:border-fd-primary focus:ring-1 focus:ring-fd-primary focus:outline-none disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted motion-reduce:transition-none"
            >
              Esc / Exit
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTrapped((prev) => !prev)}
            className="rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15 motion-reduce:transition-none"
          >
            {trapped ? 'Release trap' : 'Trap focus'}
          </button>
          <span className="font-mono text-[11px] text-fd-muted-foreground tabular-nums">
            enabled: <strong className="text-fd-card-foreground">{String(trapped)}</strong>
          </span>
        </div>

        <div
          role="group"
          aria-label="Initial focus selector"
          className="relative grid grid-cols-2 rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/2)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${initIdx * 100}%, 0, 0)`,
            }}
          />
          {INITIAL_OPTIONS.map((option, idx) => {
            const active = initIdx === idx;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => setInitIdx(idx)}
                className={`relative z-10 rounded-md px-2.5 py-1 font-mono text-[11px] font-medium tabular-nums transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
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
