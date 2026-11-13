'use client';

import { useRef, useState } from 'react';
import { useInert } from '@/hooks/useInert';

const STATE_OPTIONS = [
  { label: 'interactive', value: false },
  { label: 'inert', value: true },
] as const;

export default function UseInertDemo() {
  const [isInert, setIsInert] = useState(false);
  const [text, setText] = useState('Focusable input');
  const [clicks, setClicks] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  useInert(panelRef, isInert);

  const activeIdx = isInert ? 1 : 0;

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
          ref={panelRef}
          style={{
            transform: isInert
              ? 'scale3d(0.98, 0.98, 1)'
              : 'scale3d(1, 1, 1)',
            opacity: isInert ? 0.45 : 1,
          }}
          className="relative z-10 flex w-full max-w-sm flex-col gap-2.5 border border-fd-primary/25 bg-fd-card/85 p-3.5 shadow-2xs backdrop-blur-[2px] transition-[transform,opacity] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isInert ? 0.35 : 1 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isInert ? 0.35 : 1 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isInert ? 0.35 : 1 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isInert ? 0.35 : 1 }}
          />

          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] font-semibold tracking-wider text-fd-muted-foreground uppercase">
              target subtree
            </span>
            <span className="rounded bg-fd-muted px-1.5 py-0.5 font-mono text-[10px] text-fd-card-foreground tabular-nums">
              {isInert ? 'inert · aria-hidden="true"' : 'active'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              aria-label="Subtree input"
              className="h-8 min-w-0 flex-1 rounded-md border bg-fd-background px-2.5 text-xs text-fd-card-foreground focus:border-fd-primary focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setClicks((c) => c + 1)}
              className="h-8 shrink-0 rounded-md border bg-fd-muted/50 px-2.5 font-mono text-[11px] font-medium text-fd-card-foreground tabular-nums transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted motion-reduce:transition-none"
            >
              +1 ({clicks})
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsInert((prev) => !prev)}
            className="rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15 motion-reduce:transition-none"
          >
            {isInert ? 'Unlock subtree' : 'Lock subtree'}
          </button>
          <span className="font-mono text-[11px] text-fd-muted-foreground tabular-nums">
            clicks: <strong className="text-fd-card-foreground">{clicks}</strong>
          </span>
        </div>

        <div
          role="group"
          aria-label="Inert state"
          className="relative grid grid-cols-2 rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/2)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activeIdx * 100}%, 0, 0)`,
            }}
          />
          {STATE_OPTIONS.map((option) => {
            const active = isInert === option.value;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => setIsInert(option.value)}
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
