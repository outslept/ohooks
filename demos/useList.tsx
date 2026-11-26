"use client";

import { useRef, useState } from "react";
import { cn } from "cn";
import { ArrowUpDown, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useList } from "@/hooks/useList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface ListNode {
  id: number;
  label: string;
  rev: number;
}

const MAX_SLOTS = 4;

const INITIAL_ITEMS: ListNode[] = [
  { id: 1, label: "C-03", rev: 1 },
  { id: 2, label: "A-01", rev: 1 },
  { id: 3, label: "B-02", rev: 1 },
];

const INSERT_MODES = [
  { id: "push", label: "push()" },
  { id: "prepend", label: "insertAt(0)" },
] as const;

type InsertMode = (typeof INSERT_MODES)[number]["id"];

const LETTERS = ["D", "E", "F", "G", "H", "J", "K", "L"];

export default function UseListDemo() {
  const [items, { push, insertAt, updateAt, removeAt, sort, reset, clear }] =
    useList<ListNode>(INITIAL_ITEMS);
  const [insertMode, setInsertMode] = useState<InsertMode>("push");
  const [sortAsc, setSortAsc] = useState(true);
  const seqRef = useRef(4);
  const frameRef = useRef<HTMLDivElement>(null);

  const pulseFrame = () => {
    if (
      typeof window !== "undefined" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      frameRef.current?.animate(
        [
          { transform: "scale3d(0.98, 0.98, 1)", opacity: 0.8 },
          { transform: "scale3d(1, 1, 1)", opacity: 1 },
        ],
        { duration: 180, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
      );
    }
  };

  const handleAdd = () => {
    if (items.length >= MAX_SLOTS) return;
    const nextId = seqRef.current++;
    const prefix = LETTERS[(nextId - 4) % LETTERS.length] ?? "N";
    const nextItem: ListNode = {
      id: nextId,
      label: `${prefix}-${String(nextId).padStart(2, "0")}`,
      rev: 1,
    };

    if (insertMode === "push") {
      push(nextItem);
    } else {
      insertAt(0, nextItem);
    }
    pulseFrame();
  };

  const handleSort = () => {
    const nextAsc = !sortAsc;
    setSortAsc(nextAsc);
    sort((a, b) => (nextAsc ? a.label.localeCompare(b.label) : b.label.localeCompare(a.label)));
    pulseFrame();
  };

  const handleBumpSlot = (index: number, current: ListNode) => {
    updateAt(index, { ...current, rev: current.rev + 1 });
    pulseFrame();
  };

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between gap-2">
          <div
            role="group"
            aria-label="List insert mode"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {INSERT_MODES.map((mode) => {
              const isSelected = insertMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setInsertMode(mode.id)}
                  className={cn(
                    "rounded-[3px] px-1.5 py-0.5 font-mono text-2xs transition-all",
                    isSelected
                      ? "bg-control text-foreground shadow-control"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {mode.label}
                </button>
              );
            })}
          </div>
        </div>

        <div
          ref={frameRef}
          className="flex flex-col gap-2 rounded-md border border-border-subtle bg-subtle/35 p-2.5"
        >
          <div className="flex items-center justify-between font-mono text-2xs text-muted-foreground">
            <span>slots</span>
            <span>tap slot → updateAt(i)</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {Array.from({ length: MAX_SLOTS }, (_, idx) => {
              const entry = items[idx];

              if (!entry) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="flex h-14 flex-col items-center justify-center rounded-md border border-dashed border-border-subtle bg-subtle/20 font-mono text-2xs text-muted-foreground/50 tabular-nums"
                  >
                    <span>[{idx}]</span>
                    <span>—</span>
                  </div>
                );
              }

              return (
                <div
                  key={entry.id}
                  className="flex h-14 flex-col items-center justify-between rounded-md border border-primary/30 bg-card px-1.5 py-1 font-mono shadow-control tabular-nums"
                >
                  <div className="flex w-full items-center justify-between text-2xs text-muted-foreground">
                    <span>[{idx}]</span>
                    <button
                      type="button"
                      onClick={() => {
                        removeAt(idx);
                        pulseFrame();
                      }}
                      aria-label={`Remove index ${idx}`}
                      className="inline-flex size-3.5 items-center justify-center rounded-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      ×
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleBumpSlot(idx, entry)}
                    className="flex w-full flex-col items-center leading-tight transition-transform duration-150 ease-out active:scale-[0.97]"
                  >
                    <span className="text-xs font-semibold text-foreground">{entry.label}</span>
                    <span className="text-2xs text-primary">v{entry.rev}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>

      <CardFooter className="justify-between gap-1.5 border-t">
        <div className="flex items-center gap-1.5">
          <Button
            variant="primary"
            size="compact"
            onClick={handleAdd}
            disabled={items.length >= MAX_SLOTS}
            leadingIcon={Plus}
          >
            Add
          </Button>
          <Button
            variant="secondary"
            size="compact"
            onClick={handleSort}
            disabled={items.length < 2}
            leadingIcon={ArrowUpDown}
          >
            Sort
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-compact"
            onClick={() => {
              reset();
              pulseFrame();
            }}
            aria-label="Reset list"
          >
            <RotateCcw className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-compact"
            onClick={() => {
              clear();
              pulseFrame();
            }}
            disabled={items.length === 0}
            aria-label="Clear list"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
