"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "cn";
import { Maximize2 } from "lucide-react";
import { useMeasure } from "@/hooks/useMeasure";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

const PRESETS = [
  { w: 196, h: 80 },
  { w: 232, h: 96 },
  { w: 268, h: 112 },
] as const;

const MODES = [
  { id: "content-box", label: "content" },
  { id: "border-box", label: "border" },
  { id: "off", label: "off" },
] as const;

type ModeId = (typeof MODES)[number]["id"];

export default function UseMeasureDemo() {
  const [mode, setMode] = useState<ModeId>("content-box");
  const [presetIndex, setPresetIndex] = useState(1);
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const readoutRef = useRef<HTMLDivElement>(null);

  const isEnabled = mode !== "off";
  const boxOption: ResizeObserverBoxOptions = mode === "border-box" ? "border-box" : "content-box";

  const [measureRef, rect] = useMeasure<HTMLDivElement>({
    box: boxOption,
    enabled: isEnabled,
  });

  const attachRef = useCallback(
    (node: HTMLDivElement | null) => {
      nodeRef.current = node;
      measureRef(node);
    },
    [measureRef],
  );

  const pulseReadout = () => {
    if (
      typeof window !== "undefined" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      readoutRef.current?.animate(
        [
          { transform: "scale3d(0.97, 0.97, 1)", opacity: 0.75 },
          { transform: "scale3d(1, 1, 1)", opacity: 1 },
        ],
        { duration: 180, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
      );
    }
  };

  const cyclePreset = () => {
    const nextIndex = (presetIndex + 1) % PRESETS.length;
    const nextPreset = PRESETS[nextIndex];
    setPresetIndex(nextIndex);

    if (nodeRef.current) {
      nodeRef.current.style.width = `${nextPreset.w}px`;
      nodeRef.current.style.height = `${nextPreset.h}px`;
    }
    pulseReadout();
  };

  const selectMode = (nextMode: ModeId) => {
    setMode(nextMode);
    pulseReadout();
  };

  const currentPreset = PRESETS[presetIndex];

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between gap-2">
          <div
            role="group"
            aria-label="Measurement box model"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {MODES.map((item) => {
              const isSelected = mode === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectMode(item.id)}
                  className={cn(
                    "rounded-[3px] px-1.5 py-0.5 font-mono text-2xs transition-all",
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

        <div className="flex min-h-32 w-full items-center justify-center overflow-hidden rounded-md border border-border-subtle bg-subtle/35 p-2">
          <div
            ref={attachRef}
            style={{
              width: `${currentPreset.w}px`,
              height: `${currentPreset.h}px`,
              minWidth: "160px",
              minHeight: "72px",
              maxWidth: "100%",
              maxHeight: "128px",
            }}
            className="flex resize items-center justify-center overflow-hidden rounded-sm border border-dashed border-primary/45 bg-card px-3 py-2 shadow-control"
          >
            <div
              ref={readoutRef}
              className="pointer-events-none flex flex-col items-center justify-center gap-1 select-none"
            >
              <Badge
                variant={isEnabled ? "accent" : "secondary"}
                size="compact"
                className="tabular-nums"
              >
                {Math.round(rect.width)} × {Math.round(rect.height)} px
              </Badge>
              <span className="font-mono text-2xs text-muted-foreground tabular-nums">
                ({Math.round(rect.left)}, {Math.round(rect.top)}) → ({Math.round(rect.right)},{" "}
                {Math.round(rect.bottom)})
              </span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t">
        <Button
          variant="secondary"
          size="compact"
          onClick={cyclePreset}
          leadingIcon={Maximize2}
          className="w-full"
        >
          Cycle size preset
        </Button>
      </CardFooter>
    </Card>
  );
}
