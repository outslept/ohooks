'use client';

import { useRef, useState } from 'react';
import { ArrowUpDown, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useList } from '@/hooks/useList';

interface ListNode {
  id: number;
  label: string;
  rev: number;
}

const MAX_SLOTS = 4;

const INITIAL_ITEMS: ListNode[] = [
  { id: 1, label: 'C-03', rev: 1 },
  { id: 2, label: 'A-01', rev: 1 },
  { id: 3, label: 'B-02', rev: 1 },
];

const INSERT_MODES = [
  { id: 'push', label: 'push()' },
  { id: 'prepend', label: 'insertAt(0)' },
] as const;

type InsertMode = (typeof INSERT_MODES)[number]['id'];

const LETTERS = ['D', 'E', 'F', 'G', 'H', 'J', 'K', 'L'];

export default function UseListDemo() {
  const [
    items,
    { push, insertAt, updateAt, removeAt, sort, reset, clear },
  ] = useList<ListNode>(INITIAL_ITEMS);
  const [insertMode, setInsertMode] = useState<InsertMode>('push');
  const [sortAsc, setSortAsc] = useState(true);
  const seqRef = useRef(4);
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

  const handleAdd = () => {
    if (items.length >= MAX_SLOTS) return;
    const nextId = seqRef.current++;
    const prefix = LETTERS[(nextId - 4) % LETTERS.length] ?? 'N';
    const nextItem: ListNode = {
      id: nextId,
      label: `${prefix}-${String(nextId).padStart(2, '0')}`,
      rev: 1,
    };

    if (insertMode === 'push') {
      push(nextItem);
    } else {
      insertAt(0, nextItem);
    }
    pulseFrame();
  };

  const handleSort = () => {
    const nextAsc = !sortAsc;
    setSortAsc(nextAsc);
    sort((a, b) =>
      nextAsc
        ? a.label.localeCompare(b.label)
        : b.label.localeCompare(a.label)
    );
    pulseFrame();
  };

  const handleBumpSlot = (index: number, current: ListNode) => {
    updateAt(index, { ...current, rev: current.rev + 1 });
    pulseFrame();
  };

  const activeModeIndex = INSERT_MODES.findIndex(
    (item) => item.id === insertMode
  );

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
          className="relative flex w-full max-w-xs flex-col justify-center gap-2.5 border border-fd-primary/25 bg-fd-card/70 px-3.5 py-3 shadow-2xs backdrop-blur-[2px]"
        >
          <span
            className=" -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: items.length > 0 ? 1 : 0.35 }}
          />
          <span
            className=" -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: items.length > 0 ? 1 : 0.35 }}
          />
          <span
            className=" -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: items.length > 0 ? 1 : 0.35 }}
          />
          <span
            className=" -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: items.length > 0 ? 1 : 0.35 }}
          />

          <div className="flex w-full items-center justify-between border-b border-fd-border/60 pb-1.5 font-mono text-[11px] tabular-nums">
            <span className="text-fd-muted-foreground">
              len: <strong className="text-fd-foreground">{items.length}</strong>
              /{MAX_SLOTS}
            </span>
            <span className="text-fd-muted-foreground">
              tap slot → <span className="text-fd-primary">updateAt(i)</span>
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {Array.from({ length: MAX_SLOTS }, (_, idx) => {
              const entry = items[idx];

              if (!entry) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="flex h-14 flex-col items-center justify-center rounded-md border border-dashed border-fd-border/60 bg-fd-muted/20 font-mono text-[10px] text-fd-muted-foreground/50 tabular-nums"
                  >
                    <span>[{idx}]</span>
                    <span>—</span>
                  </div>
                );
              }

              return (
                <div
                  key={entry.id}
                  className="relative flex h-14 flex-col items-center justify-between rounded-md border border-fd-primary/35 bg-fd-primary/10 px-1.5 py-1 font-mono tabular-nums"
                >
                  <div className="flex w-full items-center justify-between text-[9px] text-fd-muted-foreground">
                    <span>[{idx}]</span>
                    <button
                      type="button"
                      onClick={() => {
                        removeAt(idx);
                        pulseFrame();
                      }}
                      aria-label={`Remove index ${idx}`}
                      className="inline-flex size-3.5 items-center justify-center rounded-xs text-fd-muted-foreground transition-[color,transform] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-foreground"
                    >
                      ×
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleBumpSlot(idx, entry)}
                    className="flex w-full flex-col items-center leading-tight transition-transform duration-150 ease-out active:scale-[0.97]"
                  >
                    <span className="text-xs font-bold text-fd-foreground">
                      {entry.label}
                    </span>
                    <span className="text-[9px] text-fd-primary">
                      v{entry.rev}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleAdd}
            disabled={items.length >= MAX_SLOTS}
            className="inline-flex items-center gap-1 rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15"
          >
            <Plus className="size-3.5" />
            Add
          </button>
          <button
            type="button"
            onClick={handleSort}
            disabled={items.length < 2}
            className="inline-flex items-center gap-1 rounded-lg border bg-fd-muted/40 px-2 py-1 text-[11px] font-medium text-fd-card-foreground transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted"
          >
            <ArrowUpDown className="size-3 text-fd-muted-foreground" />
            Sort
          </button>
          <button
            type="button"
            onClick={() => {
              reset();
              pulseFrame();
            }}
            aria-label="Reset list"
            className="inline-flex items-center justify-center rounded-lg border bg-fd-muted/40 px-2 py-1 text-[11px] font-medium text-fd-card-foreground transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted"
          >
            <RotateCcw className="size-3 text-fd-muted-foreground" />
          </button>
          <button
            type="button"
            onClick={() => {
              clear();
              pulseFrame();
            }}
            disabled={items.length === 0}
            aria-label="Clear list"
            className="inline-flex items-center justify-center rounded-lg border bg-fd-muted/40 px-2 py-1 text-[11px] font-medium text-fd-card-foreground transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted"
          >
            <Trash2 className="size-3 text-fd-muted-foreground" />
          </button>
        </div>

        <div
          role="group"
          aria-label="List insert mode"
          className="relative grid grid-cols-2 items-center rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-0.25rem)/2)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activeModeIndex * 100}%, 0, 0)`,
            }}
          />
          {INSERT_MODES.map((mode) => {
            const isSelected = insertMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setInsertMode(mode.id)}
                className={`relative z-10 px-2 py-0.5 font-mono text-[11px] font-medium transition-[color,transform] duration-150 ease-out active:scale-[0.97] ${
                  isSelected
                    ? 'text-fd-foreground'
                    : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-foreground'
                }`}
              >
                {mode.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
