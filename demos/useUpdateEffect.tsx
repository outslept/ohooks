'use client';

import { useRef, useState } from 'react';
import { Plus, RefreshCw, RotateCcw } from 'lucide-react';
import { useUpdateEffect } from '@/hooks/useUpdateEffect';

function UpdateEffectStage({ onRemount }: { onRemount: () => void }) {
  const [state, setState] = useState({ dep: 0, renders: 1 });
  const runsRef = useRef(0);
  const runsNodeRef = useRef<HTMLSpanElement>(null);
  const statusNodeRef = useRef<HTMLSpanElement>(null);
  const readoutRef = useRef<HTMLDivElement>(null);
  const cornersRef = useRef<HTMLDivElement>(null);

  useUpdateEffect(() => {
    runsRef.current += 1;

    if (runsNodeRef.current) {
      runsNodeRef.current.textContent = String(runsRef.current);
    }
    if (statusNodeRef.current) {
      statusNodeRef.current.textContent =
        runsRef.current === 1 ? 'run · effect fired' : 'runs · effect fired';
    }

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (!prefersReducedMotion) {
      readoutRef.current?.animate(
        [
          { transform: 'scale(1.04)' },
          { transform: 'scale(1)' },
        ],
        {
          duration: 180,
          easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
        },
      );

      cornersRef.current?.animate(
        [{ opacity: 1 }, { opacity: 0.45 }],
        {
          duration: 220,
          easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
        },
      );
    }
  }, [state.dep]);

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

        <div className="relative flex h-24 w-60 items-center justify-center border border-fd-primary/25 bg-fd-card/70 shadow-2xs backdrop-blur-[2px]">
          <div
            ref={cornersRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ opacity: 0.45 }}
          >
            <span className="absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary" />
            <span className="absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary" />
            <span className="absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary" />
            <span className="absolute -bottom-px -right-px size-2 border-b-2 border-r-2 border-fd-primary" />
          </div>

          <div
            ref={readoutRef}
            className="flex flex-col items-center gap-0.5 font-mono tabular-nums will-change-transform"
          >
            <div className="flex items-baseline gap-1.5">
              <span
                ref={runsNodeRef}
                className="text-2xl font-semibold tracking-tight text-fd-card-foreground"
              >
                {runsRef.current}
              </span>
              <span
                ref={statusNodeRef}
                className="text-xs text-fd-muted-foreground"
              >
                {runsRef.current === 0
                  ? 'runs · mount skipped'
                  : runsRef.current === 1
                    ? 'run · effect fired'
                    : 'runs · effect fired'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-fd-muted-foreground">
              <span>dep {state.dep}</span>
              <span aria-hidden="true" className="text-fd-border">
                ·
              </span>
              <span>renders {state.renders}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex flex-wrap items-center gap-1.5 font-mono tabular-nums">
          <button
            type="button"
            onClick={() =>
              setState((s) => ({ dep: s.dep + 1, renders: s.renders + 1 }))
            }
            className="inline-flex items-center gap-1 rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15"
          >
            <Plus className="size-3" />
            Update dep
          </button>
          <button
            type="button"
            onClick={() =>
              setState((s) => ({ ...s, renders: s.renders + 1 }))
            }
            className="inline-flex items-center gap-1 rounded-lg border bg-fd-muted/40 px-2.5 py-1 text-[11px] font-medium text-fd-card-foreground transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted"
          >
            <RefreshCw className="size-3" />
            Re-render
          </button>
          <button
            type="button"
            onClick={onRemount}
            className="inline-flex items-center gap-1 rounded-lg border bg-fd-muted/40 px-2.5 py-1 text-[11px] font-medium text-fd-card-foreground transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted"
          >
            <RotateCcw className="size-3" />
            Remount
          </button>
        </div>

        <span className="font-mono text-[11px] text-fd-muted-foreground tabular-nums">
          [dep] = [{state.dep}]
        </span>
      </div>
    </div>
  );
}

export default function UseUpdateEffectDemo() {
  const [mountKey, setMountKey] = useState(0);

  return (
    <UpdateEffectStage
      key={mountKey}
      onRemount={() => setMountKey((k) => k + 1)}
    />
  );
}
