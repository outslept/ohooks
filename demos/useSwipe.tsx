"use client";

import { useRef, useState } from "react";
import { cn } from "cn";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Move, RotateCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { type SwipeDirection, useSwipe } from "@/hooks/useSwipe";

const THRESHOLD_OPTIONS = [25, 50, 80] as const;

export default function UseSwipeDemo() {
  const padRef = useRef<HTMLDivElement>(null);
  const [threshold, setThreshold] = useState<number>(50);
  const [lastSwipe, setLastSwipe] = useState<SwipeDirection>("none");
  const [swipeCount, setSwipeCount] = useState(0);

  const { isSwiping, direction, lengthX, lengthY } = useSwipe(padRef, {
    threshold,
    preventDefault: true,
    onSwipeEnd: (state) => {
      if (state.direction !== "none") {
        setLastSwipe(state.direction);
        setSwipeCount((c) => c + 1);
      }
    },
  });

  const activeDir = isSwiping ? direction : lastSwipe;

  const offsetX = isSwiping ? Math.max(-36, Math.min(36, Math.round(-lengthX * 0.4))) : 0;
  const offsetY = isSwiping ? Math.max(-18, Math.min(18, Math.round(-lengthY * 0.4))) : 0;

  const handleReset = () => {
    setLastSwipe("none");
    setSwipeCount(0);
  };

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between">
          <div
            role="group"
            aria-label="Swipe distance threshold"
            className="inline-flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {THRESHOLD_OPTIONS.map((px) => {
              const active = threshold === px;
              return (
                <button
                  key={px}
                  type="button"
                  onClick={() => setThreshold(px)}
                  className={cn(
                    "rounded-[3px] px-1.5 py-0.5 font-mono text-2xs font-medium tabular-nums transition-all",
                    active
                      ? "bg-control text-foreground shadow-control"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {px}px
                </button>
              );
            })}
          </div>
        </div>

        <div
          ref={padRef}
          className="relative flex h-28 cursor-grab touch-none flex-col justify-between overflow-hidden rounded-md border border-border-subtle bg-subtle/35 p-3 select-none active:cursor-grabbing"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
              touch / pointer surface
            </span>
            <Badge variant="code" size="compact" className="tabular-nums">
              #{swipeCount}
            </Badge>
          </div>

          <div className="flex items-center justify-center">
            <div
              className={cn(
                "inline-flex items-center gap-1.5 rounded-sm border px-3 py-1 font-mono text-xs font-semibold tracking-wider uppercase shadow-control",
                activeDir !== "none"
                  ? "border-primary/35 bg-card text-primary"
                  : "border-border-subtle bg-card/85 text-muted-foreground",
                isSwiping
                  ? "transition-none"
                  : "transition-transform duration-200 ease-out motion-reduce:transition-none",
              )}
              style={{
                transform: `translate3d(${offsetX}px, ${offsetY}px, 0)`,
              }}
            >
              {activeDir === "up" && <ArrowUp className="size-3.5" />}
              {activeDir === "down" && <ArrowDown className="size-3.5" />}
              {activeDir === "left" && <ArrowLeft className="size-3.5" />}
              {activeDir === "right" && <ArrowRight className="size-3.5" />}
              {activeDir === "none" && <Move className="size-3.5" />}
              <span>{activeDir}</span>
            </div>
          </div>

          <div className="flex items-center justify-between font-mono text-3xs text-muted-foreground">
            <span>threshold: {threshold}px</span>
            <span>swipe in any direction</span>
          </div>
        </div>
      </CardContent>

      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col gap-0.5 px-4 py-2.5">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            Delta X
          </span>
          <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
            {Math.round(lengthX)}px
          </span>
        </div>
        <div className="flex flex-col gap-0.5 px-4 py-2.5">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            Delta Y
          </span>
          <span className="font-mono text-xs font-semibold tabular-nums text-primary">
            {Math.round(lengthY)}px
          </span>
        </div>
      </div>

      <CardFooter className="border-t">
        <Button
          variant="secondary"
          size="compact"
          leadingIcon={<RotateCcw />}
          onClick={handleReset}
          disabled={swipeCount === 0 && lastSwipe === "none"}
          className="w-full"
        >
          Reset Telemetry
        </Button>
      </CardFooter>
    </Card>
  );
}
