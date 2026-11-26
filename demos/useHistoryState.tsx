"use client";

import { useState } from "react";
import { PlusIcon, Redo2Icon, RotateCcwIcon, Trash2Icon, Undo2Icon } from "lucide-react";
import { cn } from "cn";

import { useHistoryState } from "@/hooks/useHistoryState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const CAPACITY_OPTIONS = [
  { label: "cap 3", value: 3 },
  { label: "cap 5", value: 5 },
  { label: "cap 10", value: 10 },
] as const;

export default function UseHistoryStateDemo() {
  const [capacity, setCapacity] = useState<number>(5);
  const [stepCounter, setStepCounter] = useState<number>(2);

  const { state, set, undo, redo, clear, reset, canUndo, canRedo, past, future } =
    useHistoryState<string>("v1: Initial draft", capacity);

  const commitStep = () => {
    const nextVersion = stepCounter;
    setStepCounter((c) => c + 1);
    set(`v${nextVersion}: Snapshot #${nextVersion}`);
  };

  const hasHistory = canUndo || canRedo;
  const lastPast = past.length > 0 ? past[past.length - 1] : null;
  const nextFuture = future.length > 0 ? future[0] : null;

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between gap-2">
          <div
            role="group"
            aria-label="History capacity"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {CAPACITY_OPTIONS.map((option) => {
              const active = capacity === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setCapacity(option.value)}
                  className={cn(
                    "rounded-[3px] px-1.5 py-0.5 font-mono text-3xs font-medium tabular-nums transition-all",
                    active
                      ? "bg-control text-foreground shadow-control"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 rounded-md border border-border-subtle bg-subtle/35 px-3 py-2.5">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
              Present Snapshot
            </span>
            <span className="truncate font-mono text-xs font-semibold text-foreground">
              {state || "empty"}
            </span>
          </div>
          <Badge variant="accent" size="compact" className="shrink-0">
            present
          </Badge>
        </div>

        <div className="flex items-center gap-1.5">
          <Input
            size="compact"
            type="text"
            value={state}
            onChange={(e) => set(e.target.value)}
            placeholder="Edit present state..."
            aria-label="Present history state"
            className="min-w-0 flex-1 font-mono"
          />
          <Button
            variant="primary"
            size="compact"
            onClick={commitStep}
            className="shrink-0 font-mono"
          >
            <PlusIcon />
            Step
          </Button>
        </div>
      </CardContent>

      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex min-w-0 flex-col gap-0.5 px-3 py-2">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase tabular-nums">
            Past ({past.length}/{capacity})
          </span>
          <span className="truncate font-mono text-xs font-medium text-foreground">
            {lastPast ?? "—"}
          </span>
        </div>
        <div className="flex min-w-0 flex-col gap-0.5 px-3 py-2">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase tabular-nums">
            Future ({future.length})
          </span>
          <span className="truncate font-mono text-xs font-medium text-foreground">
            {nextFuture ?? "—"}
          </span>
        </div>
      </div>

      <CardFooter className="border-t">
        <Button
          variant="secondary"
          size="compact"
          onClick={undo}
          disabled={!canUndo}
          className="flex-1"
        >
          <Undo2Icon />
          Undo
        </Button>
        <Button
          variant="secondary"
          size="compact"
          onClick={redo}
          disabled={!canRedo}
          className="flex-1"
        >
          <Redo2Icon />
          Redo
        </Button>
        <Button
          variant="tertiary"
          size="icon-compact"
          onClick={clear}
          disabled={!hasHistory}
          aria-label="Clear history"
        >
          <Trash2Icon />
        </Button>
        <Button
          variant="tertiary"
          size="icon-compact"
          onClick={() => {
            setStepCounter(2);
            reset("v1: Initial draft");
          }}
          aria-label="Reset history state"
        >
          <RotateCcwIcon />
        </Button>
      </CardFooter>
    </Card>
  );
}
