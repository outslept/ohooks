'use client';

import { useRef, useState } from 'react';
import { Code2, Plus } from 'lucide-react';
import { useMutationObserver } from '@/hooks/useMutationObserver';

const VARIANTS = ['ocean', 'amber', 'violet'] as const;
type Variant = (typeof VARIANTS)[number];

const MODES = [
  { id: 'all', label: 'all' },
  { id: 'attr', label: 'attr' },
  { id: 'off', label: 'off' },
] as const;

type ModeId = (typeof MODES)[number]['id'];

export default function UseMutationObserverDemo() {
  const targetRef = useRef<HTMLDivElement>(null);
  const [variant, setVariant] = useState<Variant>('ocean');
  const [childCount, setChildCount] = useState(2);
  const [mode, setMode] = useState<ModeId>('all');
  const [mutationCount, setMutationCount] = useState(0);
  const [lastRecord, setLastRecord] = useState('No mutations recorded yet');

  useMutationObserver(
    targetRef,
    (mutations) => {
      const latest = mutations[mutations.length - 1];
      if (!latest) return;

      setMutationCount((count) => count + mutations.length);

      if (latest.type === 'attributes' && latest.attributeName) {
        const nextVal = targetRef.current?.getAttribute(latest.attributeName);
        const prevVal = latest.oldValue ?? 'null';
        setLastRecord(`attr: "${prevVal}" → "${nextVal}"`);
      } else if (latest.type === 'childList') {
        const added = latest.addedNodes.length;
        const removed = latest.removedNodes.length;
        setLastRecord(
          added > 0
            ? `childList: +${added} node (total ${targetRef.current?.querySelectorAll('[data-child]').length ?? 0})`
            : `childList: -${removed} nodes`
        );
      }

      if (
        typeof window !== 'undefined' &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        targetRef.current?.animate(
          [
            { transform: 'scale3d(0.97, 0.97, 1)', opacity: 0.75 },
            { transform: 'scale3d(1, 1, 1)', opacity: 1 },
          ],
          { duration: 200, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }
        );
      }
    },
    {
      enabled: mode !== 'off',
      attributes: true,
      attributeOldValue: true,
      attributeFilter: ['data-variant'],
      childList: mode === 'all',
      subtree: mode === 'all',
    }
  );

  const cycleVariant = () => {
    setVariant((prev) => {
      const idx = VARIANTS.indexOf(prev);
      return VARIANTS[(idx + 1) % VARIANTS.length];
    });
  };

  const cycleChildren = () => {
    setChildCount((count) => (count >= 5 ? 1 : count + 1));
  };

  const activeModeIndex = MODES.findIndex((item) => item.id === mode);
  const isObserving = mode !== 'off';

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

        <div
          ref={targetRef}
          data-variant={variant}
          className="relative flex w-68 flex-col items-center justify-center gap-2 border border-fd-primary/25 bg-fd-card/70 px-4 py-3 shadow-2xs backdrop-blur-[2px]"
        >
          <span
            className=" -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: isObserving ? 1 : 0.35 }}
          />
          <span
            className=" -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: isObserving ? 1 : 0.35 }}
          />
          <span
            className=" -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: isObserving ? 1 : 0.35 }}
          />
          <span
            className=" -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: isObserving ? 1 : 0.35 }}
          />

          <div className="flex w-full items-center justify-between text-[10px] font-medium tracking-wider text-fd-muted-foreground uppercase">
            <span className="inline-flex items-center gap-1.5">
              <span
                className={`size-1.5 rounded-full transition-colors duration-150 ${
                  isObserving ? 'bg-fd-primary' : 'bg-fd-muted-foreground/50'
                }`}
              />
              <span>{isObserving ? `observe(${mode})` : 'disconnected'}</span>
            </span>
            <span className="font-mono tabular-nums">
              records: {mutationCount}
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-sm font-bold tracking-tight text-fd-foreground">
            <span>data-variant=&quot;{variant}&quot;</span>
          </div>

          <div className="flex items-center gap-1.5 py-0.5">
            {Array.from({ length: childCount }, (_, idx) => (
              <span
                key={idx}
                data-child={idx}
                className="size-2 rounded-xs bg-fd-primary/75"
              />
            ))}
          </div>

          <div className="w-full truncate border-t border-fd-border/60 pt-1.5 text-center font-mono text-[11px] text-fd-muted-foreground tabular-nums">
            {lastRecord}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={cycleVariant}
            className="inline-flex items-center gap-1.5 rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15"
          >
            <Code2 className="size-3.5" />
            Mutate attr
          </button>
          <button
            type="button"
            onClick={cycleChildren}
            className="inline-flex items-center gap-1 rounded-lg border bg-fd-muted/40 px-2.5 py-1 text-[11px] font-medium text-fd-card-foreground transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted"
          >
            <Plus className="size-3 text-fd-muted-foreground" />
            Child node
          </button>
        </div>

        <div
          role="group"
          aria-label="MutationObserver filter mode"
          className="relative grid grid-cols-3 items-center rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-0.25rem)/3)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activeModeIndex * 100}%, 0, 0)`,
            }}
          />
          {MODES.map((item) => {
            const isSelected = mode === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id)}
                className={`relative z-10 px-2 py-0.5 font-mono text-[11px] font-medium transition-[color,transform] duration-150 ease-out active:scale-[0.97] ${
                  isSelected
                    ? 'text-fd-foreground'
                    : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-foreground'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
