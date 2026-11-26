"use client";

import { useRef, useState } from "react";
import { cn } from "cn";
import { RotateCcw } from "lucide-react";
import { usePointerDrag, type PointerDragAxis } from "@/hooks/usePointerDrag";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

const AXES: readonly PointerDragAxis[] = ["both", "x", "y"];

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export default function UsePointerDragDemo() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [axis, setAxis] = useState<PointerDragAxis>("both");
  const [isCleared, setIsCleared] = useState(false);

  const { isDragging, deltaX, deltaY, movementX, movementY } = usePointerDrag(boxRef, {
    axis,
    preventDefault: true,
    onDragStart: () => {
      setIsCleared(false);
    },
  });

  const displayDeltaX = isCleared && !isDragging ? 0 : Math.round(deltaX);
  const displayDeltaY = isCleared && !isDragging ? 0 : Math.round(deltaY);
  const displayMoveX = isDragging ? Math.round(movementX) : 0;
  const displayMoveY = isDragging ? Math.round(movementY) : 0;

  const visualX = isDragging ? clamp(deltaX, -48, 48) : 0;
  const visualY = isDragging ? clamp(deltaY, -20, 20) : 0;

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between gap-2">
          <div
            role="group"
            aria-label="Drag axis"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {AXES.map((item) => {
              const isSelected = axis === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setAxis(item);
                    setIsCleared(true);
                  }}
                  className={cn(
                    "rounded-[3px] px-1.5 py-0.5 font-mono text-2xs transition-all",
                    isSelected
                      ? "bg-control text-foreground shadow-control"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative flex h-28 w-full items-center justify-center overflow-hidden rounded-md border border-border-subtle bg-subtle/35">
          <div
            ref={boxRef}
            style={{
              transform: `translate3d(${visualX}px, ${visualY}px, 0)`,
              touchAction: "none",
            }}
            className={cn(
              "flex w-48 flex-col items-center justify-center gap-1 rounded-md border bg-card px-3 py-2.5 shadow-control select-none",
              isDragging
                ? "cursor-grabbing border-primary/50 transition-none"
                : "cursor-grab border-border-subtle transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
            )}
          >
            <div className="flex items-baseline gap-2.5 font-mono text-sm font-semibold tracking-tight text-foreground tabular-nums">
              <span>
                <span className="mr-1 text-2xs font-normal text-muted-foreground">Δx</span>
                {displayDeltaX}px
              </span>
              <span className="text-border">/</span>
              <span>
                <span className="mr-1 text-2xs font-normal text-muted-foreground">Δy</span>
                {displayDeltaY}px
              </span>
            </div>

            <Badge variant={isDragging ? "accent" : "secondary"} size="compact">
              {isDragging ? "active drag" : "grab & drag"}
            </Badge>
          </div>
        </div>
      </CardContent>

      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="text-2xs font-medium tracking-wider text-muted-foreground uppercase">
            Delta XY
          </span>
          <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
            {displayDeltaX}, {displayDeltaY} px
          </span>
        </div>
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="text-2xs font-medium tracking-wider text-muted-foreground uppercase">
            Velocity
          </span>
          <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
            {displayMoveX}, {displayMoveY} px/f
          </span>
        </div>
      </div>

      <CardFooter className="border-t">
        <Button
          variant="secondary"
          size="compact"
          onClick={() => setIsCleared(true)}
          disabled={displayDeltaX === 0 && displayDeltaY === 0}
          leadingIcon={RotateCcw}
          className="w-full"
        >
          Reset delta
        </Button>
      </CardFooter>
    </Card>
  );
}
