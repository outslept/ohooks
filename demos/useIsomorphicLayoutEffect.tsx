"use client";

import { useRef, useState } from "react";
import { cn } from "cn";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

const PRESETS = [
  "Measured synchronously before paint",
  "Zero layout flicker",
  "SSR-safe useLayoutEffect",
] as const;

const SIZE_OPTIONS = [
  { label: "12px", className: "text-xs" },
  { label: "14px", className: "text-sm" },
  { label: "16px", className: "text-base" },
] as const;

export default function UseIsomorphicLayoutEffectDemo() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState<string>(PRESETS[0]);
  const [sizeIdx, _setSizeIdx] = useState<number>(0);
  const [rect, setRect] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  useIsomorphicLayoutEffect(() => {
    const node = boxRef.current;
    if (!node) return;

    const bounds = node.getBoundingClientRect();
    const width = Math.round(bounds.width);
    const height = Math.round(bounds.height);

    setRect((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
  }, [text, sizeIdx]);

  const cyclePreset = () => {
    const currentIdx = PRESETS.indexOf(text as (typeof PRESETS)[number]);
    const nextIdx = (currentIdx + 1) % PRESETS.length;
    setText(PRESETS[nextIdx]);
  };

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex min-h-20 flex-col items-center justify-center rounded-md border border-border-subtle bg-subtle/35 p-3">
          <div
            ref={boxRef}
            className="inline-flex max-w-full flex-col items-center gap-1 rounded-sm border border-dashed border-primary/45 bg-card px-3 py-2 shadow-control"
          >
            <span
              className={cn(
                "max-w-full truncate font-medium text-foreground",
                SIZE_OPTIONS[sizeIdx].className,
              )}
            >
              {text || "Empty"}
            </span>
            <Badge variant="accent" size="compact" className="tabular-nums">
              {rect.width} × {rect.height} px
            </Badge>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t">
        <Button variant="secondary" size="compact" onClick={cyclePreset} className="w-full">
          Cycle preset
        </Button>
      </CardFooter>
    </Card>
  );
}
