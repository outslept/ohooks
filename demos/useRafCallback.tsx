"use client";

import { useState } from "react";
import { cn } from "cn";
import { RotateCcw, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useRafCallback } from "@/hooks/useRafCallback";

const MODES = ["raf", "flush", "cancel"] as const;
type ExecMode = (typeof MODES)[number];

export default function UseRafCallbackDemo() {
  const [mode, setMode] = useState<ExecMode>("raf");
  const [rawEvents, setRawEvents] = useState(0);
  const [rafEvents, setRafEvents] = useState(0);
  const [coords, setCoords] = useState({ x: 50, y: 50 });
  const [isTracking, setIsTracking] = useState(false);

  const updateOnFrame = useRafCallback((x: number, y: number) => {
    setRafEvents((c) => c + 1);
    setCoords({ x, y });
  });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nativeEvent = e.nativeEvent as PointerEvent & {
      getCoalescedEvents?: () => PointerEvent[];
    };
    const samples =
      typeof nativeEvent.getCoalescedEvents === "function"
        ? nativeEvent.getCoalescedEvents()
        : [nativeEvent];
    const events = samples.length > 0 ? samples : [nativeEvent];

    setRawEvents((c) => c + events.length);

    for (const sample of events) {
      const x = Math.round(((sample.clientX - rect.left) / rect.width) * 100);
      const y = Math.round(((sample.clientY - rect.top) / rect.height) * 100);
      updateOnFrame(Math.max(0, Math.min(100, x)), Math.max(0, Math.min(100, y)));
    }

    if (mode === "flush") {
      updateOnFrame.flush();
    } else if (mode === "cancel") {
      updateOnFrame.cancel();
    }
  };

  const handleBurst = () => {
    const burstSize = 20;
    setRawEvents((c) => c + burstSize);

    for (let i = 1; i <= burstSize; i += 1) {
      const nextX = Math.round(15 + ((coords.x + i * 17) % 70));
      const nextY = Math.round(15 + ((coords.y + i * 13) % 70));
      updateOnFrame(nextX, nextY);
    }

    if (mode === "flush") {
      updateOnFrame.flush();
    } else if (mode === "cancel") {
      updateOnFrame.cancel();
    }
  };

  const handleReset = () => {
    updateOnFrame.cancel();
    setRawEvents(0);
    setRafEvents(0);
    setCoords({ x: 50, y: 50 });
  };

  const offsetX = Math.round((coords.x - 50) * 0.4);
  const offsetY = Math.round((coords.y - 50) * 0.24);
  const savedCount = Math.max(0, rawEvents - rafEvents);

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between">
          <div
            role="group"
            aria-label="rAF control mode"
            className="inline-flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {MODES.map((m) => {
              const active = mode === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={cn(
                    "rounded-[3px] px-2 py-0.5 font-mono text-2xs font-medium transition-all",
                    active
                      ? "bg-control text-foreground shadow-control"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {m === "raf" ? "rAF" : m}
                </button>
              );
            })}
          </div>
        </div>

        <div
          onPointerEnter={() => setIsTracking(true)}
          onPointerLeave={() => setIsTracking(false)}
          onPointerMove={handlePointerMove}
          className="relative flex h-28 cursor-crosshair touch-none flex-col justify-between overflow-hidden rounded-md border border-border-subtle bg-subtle/35 p-3 select-none"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-2xs text-muted-foreground">move pointer or burst</span>
            <Badge variant="code" size="compact" className="tabular-nums">
              {coords.x}%, {coords.y}%
            </Badge>
          </div>

          <div className="flex items-center justify-center">
            <div
              className={cn(
                "inline-flex items-center gap-1.5 rounded-sm border border-primary/30 bg-card/90 px-2.5 py-1 font-mono text-2xs text-foreground shadow-control",
                isTracking
                  ? "transition-none"
                  : "transition-transform duration-200 ease-out motion-reduce:transition-none",
              )}
              style={{
                transform: `translate3d(${offsetX}px, ${offsetY}px, 0)`,
              }}
            >
              <span className="size-1.5 rounded-full bg-primary" />
              <span className="tabular-nums">
                coalesced: <strong className="text-primary">{savedCount}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            <span>pointer sensor</span>
            <span>60–120hz frame lock</span>
          </div>
        </div>
      </CardContent>

      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col gap-0.5 px-4 py-2.5">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            Raw Calls
          </span>
          <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
            {rawEvents}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 px-4 py-2.5">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            rAF Runs
          </span>
          <span className="font-mono text-sm font-semibold tabular-nums text-primary">
            {rafEvents}
          </span>
        </div>
      </div>

      <CardFooter className="border-t">
        <Button
          variant="primary"
          size="compact"
          leadingIcon={Zap}
          onClick={handleBurst}
          className="flex-1"
        >
          Burst ×20
        </Button>
        <Button
          variant="tertiary"
          size="icon-compact"
          onClick={handleReset}
          disabled={rawEvents === 0}
          aria-label="Reset counters"
        >
          <RotateCcw />
        </Button>
      </CardFooter>
    </Card>
  );
}
