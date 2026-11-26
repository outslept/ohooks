"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from "lucide-react";
import { cn } from "cn";

import { useElementScroll } from "@/hooks/useElementScroll";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

const THROTTLE_OPTIONS = [
  { value: 0, label: "0ms" },
  { value: 80, label: "80ms" },
] as const;

const TRACK_HEIGHT = 420;
const RULER_STEPS = [0, 70, 140, 210, 280, 350];

export default function UseElementScrollDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [throttleMs, setThrottleMs] = useState<number>(0);
  const [maxScroll, setMaxScroll] = useState(292);

  const { y, isScrolling, directions, arrived, scrollTo } = useElementScroll(containerRef, {
    throttleMs,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateMaxScroll = () => {
      setMaxScroll(Math.max(1, el.scrollHeight - el.clientHeight));
    };

    updateMaxScroll();

    const observer = new ResizeObserver(updateMaxScroll);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const jumpTo = (fraction: number) => {
    const el = containerRef.current;
    if (!el) return;
    const limit = Math.max(0, el.scrollHeight - el.clientHeight);
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    scrollTo({
      top: Math.round(limit * fraction),
      behavior: reduced ? "auto" : "smooth",
    });
  };

  const progress = Math.min(1, Math.max(0, y / maxScroll));

  const statusLabel = isScrolling
    ? directions.bottom
      ? "↓ DOWN"
      : directions.top
        ? "↑ UP"
        : "SCROLL"
    : arrived.top
      ? "TOP"
      : arrived.bottom
        ? "BOTTOM"
        : "IDLE";

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between gap-2">
          <div
            role="group"
            aria-label="Throttle interval"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {THROTTLE_OPTIONS.map((option) => {
              const active = throttleMs === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setThrottleMs(option.value)}
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

        <div className="relative h-32 w-full overflow-hidden rounded-md border border-border-subtle bg-subtle/35">
          <div ref={containerRef} className="h-full w-full overflow-y-auto overscroll-contain">
            <div className="relative w-full" style={{ height: `${TRACK_HEIGHT}px` }}>
              {RULER_STEPS.map((step) => (
                <div
                  key={step}
                  style={{ top: `${step + 14}px` }}
                  className="pointer-events-none absolute right-3 left-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="h-px w-2.5 bg-border" />
                    <span className="font-mono text-3xs text-muted-foreground/70 tabular-nums">
                      {String(step).padStart(3, "0")}px
                    </span>
                  </div>
                  <span className="h-px w-2.5 bg-border" />
                </div>
              ))}
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-3">
            <div className="flex w-44 flex-col gap-2 rounded-md border border-border bg-card/90 px-3 py-2 shadow-xs backdrop-blur-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-baseline gap-1 font-mono tabular-nums">
                  <span className="text-2xs text-muted-foreground">y:</span>
                  <span className="text-sm font-semibold text-foreground">{Math.round(y)}px</span>
                </div>
                <Badge variant={isScrolling ? "accent" : "secondary"} size="compact">
                  {statusLabel}
                </Badge>
              </div>

              <div className="h-1 w-full overflow-hidden rounded-full bg-subtle">
                <div
                  className="h-full w-full origin-left bg-primary"
                  style={{
                    transform: `scale3d(${progress}, 1, 1)`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t">
        <Button
          variant="secondary"
          size="compact"
          onClick={() => jumpTo(0)}
          disabled={arrived.top}
          className="flex-1"
        >
          <ArrowUpIcon />
          Top
        </Button>
        <Button
          variant="secondary"
          size="compact"
          onClick={() => jumpTo(0.5)}
          className="flex-1 font-mono tabular-nums"
        >
          <MinusIcon />
          50%
        </Button>
        <Button
          variant="secondary"
          size="compact"
          onClick={() => jumpTo(1)}
          disabled={arrived.bottom}
          className="flex-1"
        >
          <ArrowDownIcon />
          Bottom
        </Button>
      </CardFooter>
    </Card>
  );
}
