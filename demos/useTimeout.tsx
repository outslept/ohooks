"use client";

import { useEffect, useState } from "react";
import { cn } from "cn";
import { RotateCcw, Square } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useTimeout } from "@/hooks/useTimeout";

const DELAY_OPTIONS = [
  { label: "1000ms", value: 1000 },
  { label: "2000ms", value: 2000 },
  { label: "null", value: null },
] as const;

function TimeoutProbe({ delay, onFire }: { delay: number | null; onFire: () => void }) {
  useTimeout(onFire, delay);
  return null;
}

export default function UseTimeoutDemo() {
  const [delayIdx, setDelayIdx] = useState<number>(1);
  const [lastTimedIdx, setLastTimedIdx] = useState<number>(1);
  const [runId, setRunId] = useState(0);
  const [firedCount, setFiredCount] = useState(0);
  const [isFired, setIsFired] = useState(false);
  const [activeRunKey, setActiveRunKey] = useState<string | null>(null);

  const delay = DELAY_OPTIONS[delayIdx].value;
  const isPending = delay !== null && !isFired;
  const currentRunKey = `${runId}-${delay}`;
  const fillBar = isPending && activeRunKey === currentRunKey;

  useEffect(() => {
    if (!isPending) return;
    const frame = requestAnimationFrame(() => {
      setActiveRunKey(currentRunKey);
    });
    return () => cancelAnimationFrame(frame);
  }, [isPending, currentRunKey]);

  const handleSelectDelay = (idx: number) => {
    setDelayIdx(idx);
    if (DELAY_OPTIONS[idx].value !== null) {
      setLastTimedIdx(idx);
      setIsFired(false);
      setRunId((id) => id + 1);
    }
  };

  const handleRestart = () => {
    if (delay === null) {
      setDelayIdx(lastTimedIdx);
    }
    setIsFired(false);
    setRunId((id) => id + 1);
  };

  const handleCancel = () => {
    setDelayIdx(2);
    setIsFired(false);
  };

  const handleFire = () => {
    setIsFired(true);
    setFiredCount((c) => c + 1);
  };

  const statusKey = delay === null ? "cancelled" : isFired ? "fired" : "pending";

  return (
    <Card className="w-full max-w-80">
      <TimeoutProbe key={runId} delay={isPending ? delay : null} onFire={handleFire} />

      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between">
          <div
            role="group"
            aria-label="Timeout delay"
            className="inline-flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {DELAY_OPTIONS.map((opt, idx) => {
              const active = idx === delayIdx;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => handleSelectDelay(idx)}
                  className={cn(
                    "rounded-[3px] px-1.5 py-0.5 font-mono text-2xs font-medium tabular-nums transition-all",
                    active
                      ? "bg-control text-foreground shadow-control"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative flex flex-col items-center justify-center gap-1.5 overflow-hidden rounded-md border border-border-subtle bg-subtle/35 py-5 font-mono tabular-nums">
          <div
            key={`${statusKey}-${runId}`}
            className="flex flex-col items-center gap-1 animate-in fade-in zoom-in-95 duration-150 motion-reduce:animate-none"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold tracking-tight text-foreground">
                {statusKey === "cancelled" ? "paused" : statusKey}
              </span>
              {statusKey === "fired" && (
                <Badge variant="accent" size="compact">
                  #{firedCount}
                </Badge>
              )}
            </div>
            <span className="text-2xs text-muted-foreground">
              {statusKey === "pending" && `running · ${delay}ms`}
              {statusKey === "fired" && `callback executed after ${delay}ms`}
              {statusKey === "cancelled" && "delay: null (timer cleared)"}
            </span>
          </div>

          {isPending && delay !== null && (
            <span
              key={currentRunKey}
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1 origin-left bg-primary transition-transform ease-linear motion-reduce:transition-none"
              style={{
                transitionDuration: `${delay}ms`,
                transform: fillBar ? "scaleX(1)" : "scaleX(0)",
              }}
            />
          )}
        </div>
      </CardContent>

      <CardFooter className="border-t">
        <Button
          variant="primary"
          size="compact"
          leadingIcon={<RotateCcw />}
          onClick={handleRestart}
          className="flex-1"
        >
          Restart
        </Button>
        <Button
          variant="secondary"
          size="compact"
          leadingIcon={<Square />}
          onClick={handleCancel}
          disabled={!isPending}
        >
          Cancel
        </Button>
      </CardFooter>
    </Card>
  );
}
