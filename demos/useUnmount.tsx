"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "cn";
import { Plus, RotateCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useUnmount } from "@/hooks/useUnmount";

interface UnmountSnapshot {
  step: number;
  runs: number;
  time: string;
}

const MOUNT_OPTIONS = [
  { label: "mounted", value: true },
  { label: "unmounted", value: false },
] as const;

function UnmountProbe({
  step,
  onFlushed,
}: {
  step: number;
  onFlushed: (capturedStep: number, time: string) => void;
}) {
  const activeRef = useRef(false);

  useEffect(() => {
    activeRef.current = true;
  }, []);

  useUnmount(() => {
    activeRef.current = false;
    const capturedStep = step;
    const time = new Date().toLocaleTimeString([], {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    queueMicrotask(() => {
      if (!activeRef.current) {
        onFlushed(capturedStep, time);
      }
    });
  });

  return null;
}

export default function UseUnmountDemo() {
  const [mountIdx, setMountIdx] = useState(0);
  const isMounted = MOUNT_OPTIONS[mountIdx].value;

  const [step, setStep] = useState(0);
  const [snapshot, setSnapshot] = useState<UnmountSnapshot | null>(null);

  const handleFlushed = (capturedStep: number, time: string) => {
    setSnapshot((prev) => ({
      step: capturedStep,
      runs: (prev?.runs ?? 0) + 1,
      time,
    }));
  };

  const handleReset = () => {
    setMountIdx(0);
    setStep(0);
    setSnapshot(null);
  };

  const canReset = !isMounted || step > 0 || snapshot !== null;

  return (
    <Card className="w-full max-w-80">
      {isMounted && <UnmountProbe step={step} onFlushed={handleFlushed} />}

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

        <div className="flex flex-col items-center justify-center gap-1.5 rounded-md border border-border-subtle bg-subtle/35 py-4 font-mono tabular-nums">
          <div
            key={`${isMounted}-${snapshot?.runs ?? 0}`}
            className="flex flex-col items-center gap-1 animate-in fade-in zoom-in-95 duration-150 motion-reduce:animate-none"
          >
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold tracking-tight text-foreground">
                {isMounted ? "mounted" : "unmounted"}
              </span>
              <Badge variant={isMounted ? "code" : "accent"} size="compact">
                {isMounted ? `state: ${step}` : `flushed #${snapshot?.runs ?? 1}`}
              </Badge>
            </div>
            <span className="text-2xs text-muted-foreground">
              {snapshot
                ? `captured state ${snapshot.step} at ${snapshot.time}`
                : "awaiting first unmount cleanup"}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t">
        <Button
          variant="primary"
          size="compact"
          leadingIcon={<Plus />}
          disabled={!isMounted}
          onClick={() => setStep((s) => s + 1)}
          className="flex-1 font-mono tabular-nums"
        >
          State ({step})
        </Button>
        <Button
          variant="tertiary"
          size="icon-compact"
          disabled={!canReset}
          onClick={handleReset}
          aria-label="Reset state"
        >
          <RotateCcw />
        </Button>
      </CardFooter>
    </Card>
  );
}
