"use client";

import { useRef, useState } from "react";
import { cn } from "cn";
import { ArrowRight, Play, Plus, RotateCcw, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useQueue } from "@/hooks/useQueue";

const INITIAL_JOBS = ["#101", "#102", "#103"] as const;
const BATCH_OPTIONS = [1, 2] as const;

export default function UseQueueDemo() {
  const { queue, size, first, last, isEmpty, enqueue, dequeue, clear, reset } =
    useQueue<string>(INITIAL_JOBS);

  const [batchSize, setBatchSize] = useState<(typeof BATCH_OPTIONS)[number]>(1);
  const [lastDequeued, setLastDequeued] = useState<string | null>(null);
  const nextIdRef = useRef(104);

  const handleEnqueue = () => {
    const items: string[] = [];
    for (let i = 0; i < batchSize; i += 1) {
      items.push(`#${nextIdRef.current++}`);
    }
    enqueue(...items);
  };

  const handleDequeue = () => {
    const removed = dequeue();
    if (removed !== undefined) {
      setLastDequeued(removed);
    }
  };

  const handleReset = () => {
    nextIdRef.current = 104;
    setLastDequeued(null);
    reset();
  };

  const handleClear = () => {
    setLastDequeued(null);
    clear();
  };

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between">
          <div
            role="group"
            aria-label="Enqueue batch count"
            className="inline-flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {BATCH_OPTIONS.map((count) => {
              const active = batchSize === count;
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => setBatchSize(count)}
                  className={cn(
                    "rounded-[3px] px-2 py-0.5 font-mono text-2xs font-medium tabular-nums transition-all",
                    active
                      ? "bg-control text-foreground shadow-control"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  +{count}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2.5 rounded-md border border-border-subtle bg-subtle/35 p-3">
          <div className="flex min-h-9 items-center gap-1.5 overflow-x-auto py-1">
            {isEmpty ? (
              <span className="w-full text-center font-mono text-xs text-muted-foreground">
                queue: []
              </span>
            ) : (
              queue.map((job, index) => (
                <div
                  key={job}
                  className="flex shrink-0 items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150 motion-reduce:animate-none"
                >
                  <Badge
                    variant={index === 0 ? "accent" : "code"}
                    size="default"
                    className="tabular-nums"
                  >
                    {job}
                  </Badge>
                  {index < queue.length - 1 && (
                    <ArrowRight className="size-3 text-muted-foreground/50" />
                  )}
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border-subtle pt-2 font-mono text-2xs tabular-nums text-muted-foreground">
            <span>
              size: <strong className="text-foreground">{size}</strong>
            </span>
            <span>
              last out: <strong className="text-foreground">{lastDequeued ?? "—"}</strong>
            </span>
          </div>
        </div>
      </CardContent>

      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col gap-0.5 px-4 py-2.5">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            First (Head)
          </span>
          <span className="font-mono text-xs font-semibold tabular-nums text-primary">
            {first ?? "undefined"}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 px-4 py-2.5">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            Last (Tail)
          </span>
          <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
            {last ?? "undefined"}
          </span>
        </div>
      </div>

      <CardFooter className="border-t">
        <Button
          variant="primary"
          size="compact"
          leadingIcon={Plus}
          onClick={handleEnqueue}
          className="flex-1 font-mono tabular-nums"
        >
          Enqueue +{batchSize}
        </Button>
        <Button
          variant="secondary"
          size="compact"
          leadingIcon={Play}
          onClick={handleDequeue}
          disabled={isEmpty}
        >
          Dequeue
        </Button>
        <Button
          variant="tertiary"
          size="icon-compact"
          onClick={handleReset}
          aria-label="Reset queue to initial jobs"
        >
          <RotateCcw />
        </Button>
        <Button
          variant="ghost"
          size="icon-compact"
          onClick={handleClear}
          disabled={isEmpty}
          aria-label="Clear queue"
        >
          <Trash2 />
        </Button>
      </CardFooter>
    </Card>
  );
}
