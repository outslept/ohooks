"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "cn";
import { Play, RotateCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useUnmountedRef } from "@/hooks/useUnmountedRef";

type TaskPhase = "idle" | "pending" | "committed" | "guarded";

const MOUNT_OPTIONS = [
  { label: "true", value: true },
  { label: "false", value: false },
] as const;

function WorkerProbe({
  runId,
  onPhaseChange,
}: {
  runId: number;
  onPhaseChange: (phase: TaskPhase, unmounted: boolean) => void;
}) {
  const isUnmountedRef = useUnmountedRef();
  const [, setSafeUpdates] = useState(0);

  useEffect(() => {
    const checkUnmounted = () => isUnmountedRef.current;
    onPhaseChange("idle", checkUnmounted());
    return () => {
      onPhaseChange("idle", checkUnmounted());
    };
  }, [isUnmountedRef, onPhaseChange]);

  useEffect(() => {
    if (runId === 0) return;

    onPhaseChange("pending", isUnmountedRef.current);

    const timer = window.setTimeout(() => {
      if (isUnmountedRef.current) {
        onPhaseChange("guarded", true);
        return;
      }
      setSafeUpdates((c) => c + 1);
      onPhaseChange("committed", false);
    }, 1500);

    return () => {
      void timer;
    };
  }, [runId, isUnmountedRef, onPhaseChange]);

  return null;
}

export default function UseUnmountedRefDemo() {
  const [mountIdx, setMountIdx] = useState(0);
  const isMounted = MOUNT_OPTIONS[mountIdx].value;

  const [runId, setRunId] = useState(0);
  const [phase, setPhase] = useState<TaskPhase>("idle");
  const [refValue, setRefValue] = useState(false);
  const [activeRunId, setActiveRunId] = useState<number | null>(null);

  const isPending = phase === "pending";
  const fillBar = isPending && activeRunId === runId;

  useEffect(() => {
    if (!isPending) return;
    const frame = requestAnimationFrame(() => {
      setActiveRunId(runId);
    });
    return () => cancelAnimationFrame(frame);
  }, [isPending, runId]);

  const handlePhaseChange = useCallback((nextPhase: TaskPhase, unmounted: boolean) => {
    setRefValue(unmounted);
    setPhase((prev) => {
      if (prev === "pending" && nextPhase === "idle") {
        return "pending";
      }
      return nextPhase;
    });
  }, []);

  const handleRun = () => {
    if (!isMounted) {
      setMountIdx(0);
    }
    setRunId((id) => id + 1);
  };

  const handleReset = () => {
    setMountIdx(0);
    setRunId(0);
    setPhase("idle");
    setRefValue(false);
  };

  return (
    <Card className="w-full max-w-80">
      {isMounted && <WorkerProbe runId={runId} onPhaseChange={handlePhaseChange} />}

      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between">
          <div
            role="group"
            aria-label="Component mount state"
            className="inline-flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {MOUNT_OPTIONS.map((opt, idx) => {
              const active = idx === mountIdx;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setMountIdx(idx)}
                  className={cn(
                    "rounded-[3px] px-2 py-0.5 font-mono text-2xs font-medium transition-all",
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
            key={`${phase}-${refValue}`}
            className="flex flex-col items-center gap-1 animate-in fade-in zoom-in-95 duration-150 motion-reduce:animate-none"
          >
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold tracking-tight text-foreground">
                ref.current: {String(refValue)}
              </span>
              <Badge
                variant={
                  phase === "guarded" ? "warning" : phase === "committed" ? "accent" : "code"
                }
                size="compact"
              >
                {phase}
              </Badge>
            </div>
            <span className="text-2xs text-muted-foreground">
              {phase === "idle" && (isMounted ? "mounted · standby" : "unmounted · standby")}
              {phase === "pending" &&
                (isMounted ? "1500ms · toggle mounted → false" : "1500ms · unmounted in-flight")}
              {phase === "committed" && "resolved · setState executed safely"}
              {phase === "guarded" && "resolved · setState skipped (guarded)"}
            </span>
          </div>

          {isPending && (
            <span
              key={runId}
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1 origin-left bg-primary transition-transform duration-1500 ease-linear motion-reduce:transition-none"
              style={{
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
          leadingIcon={<Play />}
          disabled={isPending}
          onClick={handleRun}
          className="flex-1"
        >
          Run 1.5s Task
        </Button>
        <Button
          variant="tertiary"
          size="icon-compact"
          disabled={phase === "idle" && isMounted}
          onClick={handleReset}
          aria-label="Reset state"
        >
          <RotateCcw />
        </Button>
      </CardFooter>
    </Card>
  );
}
