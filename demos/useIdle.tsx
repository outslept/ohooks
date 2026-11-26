"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIcon } from "lucide-react";
import { cn } from "cn";

import { useIdle } from "@/hooks/useIdle";
import { useThrottleCallback } from "@/hooks/useThrottleCallback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

const TIMEOUT_OPTIONS = [
  { label: "1.5s", value: 1500 },
  { label: "3s", value: 3000 },
  { label: "5s", value: 5000 },
] as const;

const ACTIVITY_EVENTS: ReadonlyArray<keyof WindowEventMap> = [
  "mousemove",
  "mousedown",
  "resize",
  "keydown",
  "touchstart",
  "wheel",
];

const THROTTLE_MS = 150;

export default function UseIdleDemo() {
  const [timeoutMs, setTimeoutMs] = useState<number>(3000);
  const isIdle = useIdle(timeoutMs, { throttleMs: THROTTLE_MS });
  const barRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<Animation | null>(null);

  const startSweep = useCallback(() => {
    const bar = barRef.current;
    if (!bar || typeof window === "undefined") return;

    animRef.current?.cancel();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      bar.style.transform = "scale3d(0, 1, 1)";
      return;
    }

    animRef.current = bar.animate(
      [{ transform: "scale3d(0, 1, 1)" }, { transform: "scale3d(1, 1, 1)" }],
      {
        duration: timeoutMs,
        easing: "linear",
        fill: "forwards",
      },
    );
  }, [timeoutMs]);

  const throttledSweep = useThrottleCallback(startSweep, THROTTLE_MS);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    startSweep();

    const listener = () => {
      throttledSweep();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        listener();
      }
    };

    for (const eventName of ACTIVITY_EVENTS) {
      window.addEventListener(eventName, listener, { passive: true });
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      animRef.current?.cancel();
      throttledSweep.cancel();
      for (const eventName of ACTIVITY_EVENTS) {
        window.removeEventListener(eventName, listener);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [startSweep, throttledSweep]);

  useEffect(() => {
    if (isIdle && barRef.current) {
      animRef.current?.cancel();
      barRef.current.style.transform = "scale3d(1, 1, 1)";
    }
  }, [isIdle]);

  const triggerWake = () => {
    window.dispatchEvent(new Event("mousemove"));
  };

  const selectTimeout = (value: number) => {
    setTimeoutMs(value);
    window.dispatchEvent(new Event("mousemove"));
  };

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between gap-2">
          <div
            role="group"
            aria-label="Idle timeout"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {TIMEOUT_OPTIONS.map((option) => {
              const active = timeoutMs === option.value;
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => selectTimeout(option.value)}
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

        <div className="flex flex-col gap-2.5 rounded-md border border-border-subtle bg-subtle/35 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-xs font-semibold text-foreground uppercase">
              {isIdle ? "Idle Threshold Reached" : "Monitoring Activity"}
            </span>

            <Badge variant={isIdle ? "warning" : "accent"} size="compact" className="uppercase">
              {isIdle ? "Idle" : "Active"}
            </Badge>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full border border-border-subtle/60 bg-subtle">
            <div
              ref={barRef}
              className={cn("h-full w-full origin-left", isIdle ? "bg-warning" : "bg-primary")}
              style={{
                transform: isIdle ? "scale3d(1, 1, 1)" : "scale3d(0, 1, 1)",
              }}
            />
          </div>
        </div>
      </CardContent>

      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            isIdle
          </span>
          <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
            {String(isIdle)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            Timeout
          </span>
          <span className="font-mono text-xs font-semibold text-primary tabular-nums">
            {timeoutMs}ms
          </span>
        </div>
      </div>

      <CardFooter className="border-t">
        <Button variant="primary" size="compact" onClick={triggerWake} className="w-full">
          <ActivityIcon />
          Emit Wake Event
        </Button>
      </CardFooter>
    </Card>
  );
}
