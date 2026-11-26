"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "cn";
import { Check, Loader2, Play, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useSpinDelay } from "@/hooks/useSpinDelay";

const DURATION_OPTIONS = [180, 450, 900] as const;
const DELAY_MS = 350;
const MIN_DURATION_MS = 500;

export default function UseSpinDelayDemo() {
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState<number>(180);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const barAnimRef = useRef<Animation | null>(null);

  const showSmartSpinner = useSpinDelay(isLoading, {
    delay: DELAY_MS,
    minDuration: MIN_DURATION_MS,
  });

  const clearSimulationTimer = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const animateBar = (ms: number) => {
    const bar = barRef.current;
    if (!bar) return;
    barAnimRef.current?.cancel();
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    barAnimRef.current = bar.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], {
      duration: ms,
      easing: "linear",
    });
  };

  const simulateFetch = (durationMs = duration) => {
    clearSimulationTimer();
    setIsLoading(true);
    animateBar(durationMs);
    timerRef.current = setTimeout(() => {
      setIsLoading(false);
      timerRef.current = null;
    }, durationMs);
  };

  const toggleManualLoad = () => {
    clearSimulationTimer();
    barAnimRef.current?.cancel();
    setIsLoading((prev) => !prev);
  };

  useEffect(() => {
    return () => {
      clearSimulationTimer();
      barAnimRef.current?.cancel();
    };
  }, []);

  const thresholdPercent = Math.min(100, Math.round((DELAY_MS / 900) * 100));

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between">
          <div
            role="group"
            aria-label="Simulated request duration"
            className="inline-flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {DURATION_OPTIONS.map((ms) => {
              const active = duration === ms;
              return (
                <button
                  key={ms}
                  type="button"
                  onClick={() => {
                    setDuration(ms);
                    simulateFetch(ms);
                  }}
                  className={cn(
                    "rounded-[3px] px-1.5 py-0.5 font-mono text-2xs font-medium tabular-nums transition-all",
                    active
                      ? "bg-control text-foreground shadow-control"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {ms}ms
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-md border border-border-subtle bg-subtle/35 p-3">
          <div className="grid grid-cols-2 divide-x divide-border-subtle">
            <div className="flex flex-col gap-1 pr-3">
              <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
                Raw loading
              </span>
              <div className="flex h-5 items-center font-mono text-xs font-semibold">
                {isLoading ? (
                  <span className="inline-flex items-center gap-1.5 text-warning">
                    <Loader2 className="size-3.5 animate-spin motion-reduce:animate-none" />
                    Spinning
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <Check className="size-3" />
                    Idle
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1 pl-3">
              <span className="font-mono text-3xs tracking-wider text-primary uppercase">
                useSpinDelay
              </span>
              <div className="flex h-5 items-center font-mono text-xs font-semibold">
                {showSmartSpinner ? (
                  <span className="inline-flex items-center gap-1.5 text-primary">
                    <Loader2 className="size-3.5 animate-spin motion-reduce:animate-none" />
                    Visible
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <Check className="size-3" />
                    Suppressed
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-subtle">
              <div ref={barRef} className="h-full w-full origin-left scale-x-0 bg-primary" />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-foreground/40"
                style={{ left: `${thresholdPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between font-mono text-3xs tabular-nums text-muted-foreground">
              <span>delay: {DELAY_MS}ms</span>
              <span>minDuration: {MIN_DURATION_MS}ms</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t">
        <Button
          variant="primary"
          size="compact"
          leadingIcon={<Play />}
          onClick={() => simulateFetch(duration)}
          className="flex-1 font-mono tabular-nums"
        >
          Simulate ({duration}ms)
        </Button>
        <Button
          variant="secondary"
          size="compact"
          active={isLoading}
          leadingIcon={<Square />}
          onClick={toggleManualLoad}
        >
          {isLoading ? "Stop" : "Hold"}
        </Button>
      </CardFooter>
    </Card>
  );
}
