"use client";

import { useRef, useState } from "react";
import { Maximize2Icon } from "lucide-react";
import { cn } from "cn";

import { useElementSize } from "@/hooks/useElementSize";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

type BoxMode = "border-box" | "content-box";

const BOX_MODES: { value: BoxMode; label: string }[] = [
  { value: "border-box", label: "border-box" },
  { value: "content-box", label: "content-box" },
];

const PRESETS = [
  { width: 200, height: 84, label: "200×84" },
  { width: 248, height: 104, label: "248×104" },
  { width: 156, height: 68, label: "156×68" },
] as const;

export default function UseElementSizeDemo() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [boxMode, setBoxMode] = useState<BoxMode>("border-box");
  const [presetIdx, setPresetIdx] = useState(0);

  const { width, height } = useElementSize(boxRef, {
    box: boxMode,
    initialWidth: PRESETS[0].width,
    initialHeight: PRESETS[0].height,
  });

  const cyclePreset = () => {
    const nextIdx = (presetIdx + 1) % PRESETS.length;
    setPresetIdx(nextIdx);
    const el = boxRef.current;
    if (el) {
      el.style.width = `${PRESETS[nextIdx].width}px`;
      el.style.height = `${PRESETS[nextIdx].height}px`;
    }
  };

  const nextPresetLabel = PRESETS[(presetIdx + 1) % PRESETS.length].label;

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between gap-2">
          <div
            role="group"
            aria-label="Box model"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {BOX_MODES.map((mode) => {
              const active = boxMode === mode.value;
              return (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => setBoxMode(mode.value)}
                  className={cn(
                    "rounded-[3px] px-1.5 py-0.5 font-mono text-3xs font-medium transition-all",
                    active
                      ? "bg-control text-foreground shadow-control"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {mode.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex min-h-32 w-full items-center justify-center overflow-hidden rounded-md border border-border-subtle bg-subtle/25 p-2">
          <div
            ref={boxRef}
            style={{
              width: `${PRESETS[0].width}px`,
              height: `${PRESETS[0].height}px`,
            }}
            className="relative flex max-h-28 max-w-full min-h-16 min-w-32 resize-both flex-col items-center justify-center gap-1 overflow-hidden rounded-sm border border-border bg-card p-3 shadow-2xs"
          >
            <div className="pointer-events-none flex items-baseline gap-1 font-mono text-sm font-semibold tracking-tight text-foreground tabular-nums">
              <span>{Math.round(width)}</span>
              <span className="text-xs font-normal text-muted-foreground">×</span>
              <span>{Math.round(height)}</span>
              <span className="ml-0.5 text-2xs font-normal text-muted-foreground">px</span>
            </div>

            <Badge variant="code" size="compact" className="pointer-events-none">
              {boxMode === "content-box" ? "content only" : "padding + border"}
            </Badge>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t">
        <Button
          variant="secondary"
          size="compact"
          onClick={cyclePreset}
          className="w-full font-mono tabular-nums"
        >
          <Maximize2Icon />
          Apply Preset ({nextPresetLabel}px)
        </Button>
      </CardFooter>
    </Card>
  );
}
