"use client";

import { useRef, useState } from "react";
import { cn } from "cn";
import { Pause, Play, RotateCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useResizeObserver } from "@/hooks/useResizeObserver";

const PRESETS = [
  { key: "sm", label: "SM", width: 184, height: 76 },
  { key: "md", label: "MD", width: 228, height: 92 },
  { key: "lg", label: "LG", width: 272, height: 108 },
] as const;

type PresetKey = (typeof PRESETS)[number]["key"];

export default function UseResizeObserverDemo() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [presetKey, setPresetKey] = useState<PresetKey>("md");
  const [enabled, setEnabled] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 228, height: 92 });
  const [eventCount, setEventCount] = useState(0);

  useResizeObserver(
    boxRef,
    (entry) => {
      const nextWidth = Math.round(entry.contentRect.width);
      const nextHeight = Math.round(entry.contentRect.height);
      setDimensions((prev) =>
        prev.width === nextWidth && prev.height === nextHeight
          ? prev
          : { width: nextWidth, height: nextHeight },
      );
      setEventCount((c) => c + 1);
    },
    { enabled },
  );

  const applyPreset = (key: PresetKey) => {
    setPresetKey(key);
    const preset = PRESETS.find((p) => p.key === key);
    const el = boxRef.current;
    if (preset && el) {
      el.style.width = `${preset.width}px`;
      el.style.height = `${preset.height}px`;
    }
  };

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between">
          <div
            role="group"
            aria-label="Box size presets"
            className="inline-flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {PRESETS.map((preset) => {
              const active = presetKey === preset.key;
              return (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => applyPreset(preset.key)}
                  className={cn(
                    "rounded-[3px] px-2 py-0.5 font-mono text-2xs font-medium transition-all",
                    active
                      ? "bg-control text-foreground shadow-control"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex min-h-32 items-center justify-center rounded-md border border-border-subtle bg-subtle/35 p-2">
          <div
            ref={boxRef}
            style={{ width: "228px", height: "92px" }}
            className={cn(
              "relative flex max-h-28 min-h-18 max-w-full min-w-40 resize flex-col justify-between overflow-hidden rounded-sm border bg-card/90 p-2.5 shadow-control transition-colors",
              enabled ? "border-primary/35" : "border-border-subtle opacity-75",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
                content-box
              </span>
              <Badge variant="code" size="compact" className="tabular-nums">
                #{eventCount}
              </Badge>
            </div>

            <div className="flex items-baseline justify-center gap-1 font-mono tabular-nums">
              <span className="text-sm font-semibold text-foreground">{dimensions.width}</span>
              <span className="text-2xs text-muted-foreground">×</span>
              <span className="text-sm font-semibold text-primary">{dimensions.height}</span>
              <span className="text-2xs text-muted-foreground">px</span>
            </div>

            <div className="flex items-center justify-end font-mono text-3xs text-muted-foreground">
              <span>drag corner ↘</span>
            </div>
          </div>
        </div>
      </CardContent>

      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col gap-0.5 px-4 py-2.5">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            Dimensions
          </span>
          <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
            {dimensions.width} × {dimensions.height}px
          </span>
        </div>
        <div className="flex flex-col gap-0.5 px-4 py-2.5">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            Events Fired
          </span>
          <span className="font-mono text-xs font-semibold tabular-nums text-primary">
            {eventCount}
          </span>
        </div>
      </div>

      <CardFooter className="border-t">
        <Button
          variant={enabled ? "secondary" : "primary"}
          size="compact"
          leadingIcon={enabled ? Pause : Play}
          onClick={() => setEnabled((prev) => !prev)}
          className="flex-1"
        >
          {enabled ? "Pause" : "Observe"}
        </Button>
        <Button
          variant="tertiary"
          size="icon-compact"
          onClick={() => applyPreset(presetKey)}
          aria-label="Reset box dimensions to preset"
        >
          <RotateCcw />
        </Button>
      </CardFooter>
    </Card>
  );
}
