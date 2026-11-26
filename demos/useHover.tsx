"use client";

import { useRef, useState } from "react";
import { MousePointerIcon } from "lucide-react";
import { cn } from "cn";

import { useHover } from "@/hooks/useHover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

const DELAY_PRESETS = [
  { label: "0ms", enterDelay: 0, leaveDelay: 0 },
  { label: "150ms", enterDelay: 150, leaveDelay: 150 },
  { label: "400ms", enterDelay: 400, leaveDelay: 400 },
] as const;

export default function UseHoverDemo() {
  const targetRef = useRef<HTMLDivElement>(null);
  const [presetIdx, setPresetIdx] = useState<number>(1);
  const [enterCount, setEnterCount] = useState<number>(0);

  const preset = DELAY_PRESETS[presetIdx];

  const isHovered = useHover(targetRef, {
    enterDelay: preset.enterDelay,
    leaveDelay: preset.leaveDelay,
    onEnter: () => setEnterCount((c) => c + 1),
  });

  const toggleSimulatedHover = () => {
    const el = targetRef.current;
    if (!el) return;
    el.dispatchEvent(
      new MouseEvent(isHovered ? "mouseleave" : "mouseenter", {
        bubbles: false,
        cancelable: true,
      }),
    );
  };

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between gap-2">
          <div
            role="group"
            aria-label="Hover enter and leave delay"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {DELAY_PRESETS.map((option, idx) => {
              const active = presetIdx === idx;
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setPresetIdx(idx)}
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

        <div
          ref={targetRef}
          className={cn(
            "flex min-h-24 cursor-default flex-col items-center justify-center gap-1.5 rounded-md border px-4 py-4 text-center transition-all select-none",
            isHovered
              ? "scale-[1.01] border-primary/45 bg-primary/5"
              : "border-border-subtle bg-subtle/35",
          )}
        >
          <Badge variant={isHovered ? "accent" : "secondary"} size="compact" className="uppercase">
            {isHovered ? "Pointer Inside" : "Hover Sensor Pad"}
          </Badge>

          <span className="font-mono text-2xs text-muted-foreground tabular-nums">
            enter: {preset.enterDelay}ms · leave: {preset.leaveDelay}ms
          </span>
        </div>
      </CardContent>

      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            isHovered
          </span>
          <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
            {String(isHovered)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            Enter Count
          </span>
          <span className="font-mono text-xs font-semibold text-primary tabular-nums">
            {enterCount}
          </span>
        </div>
      </div>

      <CardFooter className="border-t">
        <Button
          variant={isHovered ? "secondary" : "primary"}
          size="compact"
          onClick={toggleSimulatedHover}
          className="w-full"
        >
          <MousePointerIcon />
          {isHovered ? "Simulate mouseleave" : "Simulate mouseenter"}
        </Button>
      </CardFooter>
    </Card>
  );
}
