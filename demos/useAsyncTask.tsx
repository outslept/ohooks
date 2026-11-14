"use client";

import * as React from "react";
import { Loader2, Play, RotateCcw, Square } from "lucide-react";
import { useAsyncTask } from "@/hooks/useAsyncTask";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "cn";

interface TaskPayload {
  id: number;
  timestamp: string;
}

const MODE_OPTIONS = [
  { label: "Resolve", shouldFail: false },
  { label: "Reject", shouldFail: true },
] as const;

export function UseAsyncTaskDemo() {
  const [modeIdx, setModeIdx] = React.useState(0);
  const [runId, setRunId] = React.useState(0);
  const [activeRunId, setActiveRunId] = React.useState<number | null>(null);

  const shouldFail = MODE_OPTIONS[modeIdx].shouldFail;

  const { run, abort, reset, status, data, error, isIdle, isPending } =
    useAsyncTask(
      async ({ signal }, fail: boolean): Promise<TaskPayload> => {
        await new Promise<void>((resolve, reject) => {
          const timer = setTimeout(resolve, 1500);
          signal.addEventListener(
            "abort",
            () => {
              clearTimeout(timer);
              reject(new DOMException("Aborted", "AbortError"));
            },
            { once: true }
          );
        });

        if (fail) {
          throw new Error("503 Service Unavailable");
        }

        return {
          id: Math.floor(Math.random() * 900 + 100),
          timestamp: new Date().toLocaleTimeString([], {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
        };
      }
    );

  const fillBar = isPending && activeRunId === runId;

  React.useEffect(() => {
    if (!isPending) return;
    const frame = requestAnimationFrame(() => {
      setActiveRunId(runId);
    });
    return () => cancelAnimationFrame(frame);
  }, [isPending, runId]);

  const handleRun = () => {
    setRunId((prev) => prev + 1);
    void run(shouldFail);
  };

  const cornerColorClass =
    status === "error"
      ? "border-destructive"
      : status === "aborted"
        ? "border-warning"
        : status === "success"
          ? "border-success"
          : "border-foreground";

  return (
    <Card className="w-full max-w-80">
      <CardHeader>
        <CardAction>
          <div
            role="group"
            aria-label="Task outcome"
            className="inline-flex items-center gap-0.5 rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {MODE_OPTIONS.map((option, idx) => {
              const selected = idx === modeIdx;
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setModeIdx(idx)}
                  className={cn(
                    "rounded-2xs px-1.5 py-0.5 font-mono text-3xs font-medium tabular-nums outline-none select-none",
                    "transition-colors duration-150 ease-out",
                    selected
                      ? "bg-control text-foreground shadow-control"
                      : "text-muted-foreground pointer-hover:hover:text-foreground",
                    "focus-visible:ring-1 focus-visible:ring-ring"
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col items-center justify-center py-6">
        <div className="relative flex h-28 w-full items-center justify-center overflow-hidden rounded-md border border-border-subtle bg-subtle/35 px-4">
          <span
            aria-hidden="true"
            className={cn(
              "absolute top-1.5 left-1.5 size-2 border-t-[1.5px] border-l-[1.5px] transition-[opacity,border-color] duration-200 ease-out",
              cornerColorClass,
              isPending ? "opacity-90" : "opacity-35"
            )}
          />
          <span
            aria-hidden="true"
            className={cn(
              "absolute top-1.5 right-1.5 size-2 border-t-[1.5px] border-r-[1.5px] transition-[opacity,border-color] duration-200 ease-out",
              cornerColorClass,
              isPending ? "opacity-90" : "opacity-35"
            )}
          />
          <span
            aria-hidden="true"
            className={cn(
              "absolute bottom-1.5 left-1.5 size-2 border-b-[1.5px] border-l-[1.5px] transition-[opacity,border-color] duration-200 ease-out",
              cornerColorClass,
              isPending ? "opacity-90" : "opacity-35"
            )}
          />
          <span
            aria-hidden="true"
            className={cn(
              "absolute bottom-1.5 right-1.5 size-2 border-r-[1.5px] border-b-[1.5px] transition-[opacity,border-color] duration-200 ease-out",
              cornerColorClass,
              isPending ? "opacity-90" : "opacity-35"
            )}
          />

          {isPending && (
            <span
              key={runId}
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left bg-foreground transition-transform duration-1500 ease-linear motion-reduce:transition-none"
              style={{
                transform: fillBar ? "scaleX(1)" : "scaleX(0)",
              }}
            />
          )}

          <div
            key={`${status}-${runId}`}
            className="animate-in fade-in zoom-in-95 flex flex-col items-center gap-1.5 text-center font-mono tabular-nums duration-150 ease-snappy motion-reduce:animate-none"
          >
            {status === "idle" && (
              <>
                <Badge size="compact" variant="secondary" className="font-mono">
                  STANDBY
                </Badge>
                <span className="text-2xs text-muted-foreground">
                  Ready to dispatch
                </span>
              </>
            )}

            {status === "pending" && (
              <>
                <div className="flex items-center gap-1.5 text-sm font-semibold tracking-tight text-foreground">
                  <Loader2 className="size-3.5 animate-spinner text-foreground" />
                  <span>Running…</span>
                </div>
                <span className="text-2xs text-muted-foreground">
                  1500ms · AbortController
                </span>
              </>
            )}

            {status === "success" && data && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-semibold tracking-tight text-foreground">
                    #{data.id}
                  </span>
                  <Badge size="compact" variant="code">
                    200 OK
                  </Badge>
                </div>
                <span className="text-2xs text-muted-foreground">
                  Resolved at {data.timestamp}
                </span>
              </>
            )}

            {status === "error" && error && (
              <>
                <Badge size="compact" variant="destructive" className="font-mono">
                  503 ERROR
                </Badge>
                <span className="text-2xs text-muted-foreground">
                  {error.message}
                </span>
              </>
            )}

            {status === "aborted" && (
              <>
                <Badge size="compact" variant="warning" className="font-mono">
                  ABORTED
                </Badge>
                <span className="text-2xs text-muted-foreground">
                  AbortSignal triggered
                </span>
              </>
            )}
          </div>
        </div>
      </CardContent>

      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col items-center py-2.5">
          <span className="text-3xs font-medium tracking-wider text-muted-foreground uppercase">
            Status
          </span>
          <span className="mt-0.5 font-mono text-xs font-medium text-foreground uppercase tabular-nums">
            {status}
          </span>
        </div>
        <div className="flex flex-col items-center py-2.5">
          <span className="text-3xs font-medium tracking-wider text-muted-foreground uppercase">
            Signal
          </span>
          <span className="mt-0.5 font-mono text-xs font-medium text-foreground tabular-nums">
            {status === "aborted"
              ? "aborted"
              : isPending
                ? "active"
                : "idle"}
          </span>
        </div>
      </div>

      <CardFooter className="border-t">
        <Button
          size="compact"
          variant="secondary"
          leadingIcon={Play}
          onClick={handleRun}
          className="flex-1"
        >
          Run
        </Button>

        <Button
          size="compact"
          variant={isPending ? "destructive" : "secondary"}
          leadingIcon={Square}
          disabled={!isPending}
          onClick={() => abort()}
        >
          Abort
        </Button>

        <Button
          size="compact"
          variant="secondary"
          leadingIcon={RotateCcw}
          disabled={isIdle}
          onClick={reset}
          aria-label="Reset state"
        >
          Reset
        </Button>
      </CardFooter>
    </Card>
  );
}

export default UseAsyncTaskDemo;
