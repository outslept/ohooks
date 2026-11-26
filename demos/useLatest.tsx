"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "cn";
import { Clock, Plus } from "lucide-react";
import { useLatest } from "@/hooks/useLatest";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

const DELAYS = [
  { ms: 1000, label: "1s" },
  { ms: 2000, label: "2s" },
  { ms: 3000, label: "3s" },
] as const;

type DelayMs = (typeof DELAYS)[number]["ms"];

export default function UseLatestDemo() {
  const [count, setCount] = useState(0);
  const [delayMs, setDelayMs] = useState<DelayMs>(2000);
  const [waiting, setWaiting] = useState(false);
  const [result, setResult] = useState<{
    stale: number;
    latest: number;
  } | null>(null);

  const latestCountRef = useLatest(count);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const clearPendingTimer = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const scheduleDelayedRead = () => {
    clearPendingTimer();
    const closureSnapshot = count;
    setWaiting(true);

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setResult({
        stale: closureSnapshot,
        latest: latestCountRef.current,
      });
      setWaiting(false);

      if (
        typeof window !== "undefined" &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        frameRef.current?.animate(
          [
            { transform: "scale3d(0.97, 0.97, 1)", opacity: 0.75 },
            { transform: "scale3d(1, 1, 1)", opacity: 1 },
          ],
          { duration: 200, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
        );
      }
    }, delayMs);
  };

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between gap-2">
          <div
            role="group"
            aria-label="Read delay duration"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {DELAYS.map((item) => {
              const isSelected = delayMs === item.ms;
              return (
                <button
                  key={item.ms}
                  type="button"
                  disabled={waiting}
                  onClick={() => setDelayMs(item.ms)}
                  className={cn(
                    "rounded-[3px] px-1.5 py-0.5 font-mono text-2xs tabular-nums transition-all disabled:pointer-events-none disabled:opacity-50",
                    isSelected
                      ? "bg-control text-foreground shadow-control"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div
          ref={frameRef}
          className="flex flex-col gap-2.5 rounded-md border border-border-subtle bg-subtle/35 px-3 py-3"
        >
          <div className="grid w-full grid-cols-3 divide-x divide-border-subtle text-center font-mono tabular-nums">
            <div className="flex flex-col gap-0.5 px-1">
              <span className="text-2xs text-muted-foreground">live</span>
              <span className="text-lg font-semibold text-foreground">{count}</span>
            </div>
            <div className="flex flex-col gap-0.5 px-1">
              <span className="text-2xs text-muted-foreground">closure</span>
              <span className="text-lg font-semibold text-muted-foreground">
                {result !== null ? result.stale : "—"}
              </span>
            </div>
            <div className="flex flex-col gap-0.5 px-1">
              <span className="text-2xs text-primary">latestRef</span>
              <span className="text-lg font-semibold text-primary">
                {result !== null ? result.latest : "—"}
              </span>
            </div>
          </div>

          <div className="h-1 w-full overflow-hidden rounded-full bg-subtle">
            <div
              className={cn(
                "h-full w-full origin-left bg-primary motion-reduce:transition-none",
                waiting ? "transition-transform ease-linear" : "transition-none",
              )}
              style={{
                transform: `scale3d(${waiting ? 1 : 0}, 1, 1)`,
                transitionDuration: waiting ? `${delayMs}ms` : "0ms",
              }}
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="gap-2 border-t">
        <Button
          variant="primary"
          size="compact"
          onClick={() => setCount((c) => c + 1)}
          leadingIcon={Plus}
          className="flex-1 font-mono tabular-nums"
        >
          1 ({count})
        </Button>
        <Button
          variant="secondary"
          size="compact"
          onClick={scheduleDelayedRead}
          disabled={waiting}
          leadingIcon={Clock}
          className="flex-1"
        >
          {waiting ? "Pending…" : "Schedule read"}
        </Button>
      </CardFooter>
    </Card>
  );
}
