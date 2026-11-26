"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useVisualViewport } from "@/hooks/useVisualViewport";

export default function UseVisualViewportDemo() {
  const { width, height, scale, offsetLeft, offsetTop, pageTop } = useVisualViewport();

  const [isActive, setIsActive] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setIsActive(true);
    const id = window.setTimeout(() => setIsActive(false), 160);
    return () => window.clearTimeout(id);
  }, [width, height, scale, offsetLeft, offsetTop, pageTop]);

  const scaleX = width > 0 ? Math.min(1, Math.max(0.35, width / 1920)) : 0.75;
  const scaleY = height > 0 ? Math.min(1, Math.max(0.4, height / 1080)) : 0.75;
  const shiftX = Math.max(-16, Math.min(16, offsetLeft * 0.08));
  const shiftY = Math.max(-12, Math.min(12, offsetTop * 0.08));

  const roundedW = Math.round(width);
  const roundedH = Math.round(height);
  const roundedOffsetX = Math.round(offsetLeft);
  const roundedOffsetY = Math.round(offsetTop);
  const roundedPageTop = Math.round(pageTop);

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between">
          <Badge
            variant={isActive ? "accent" : "code"}
            size="compact"
            className="font-mono tabular-nums"
          >
            {scale.toFixed(2)}x
          </Badge>
        </div>

        <div className="relative flex h-28 w-full items-center justify-center overflow-hidden rounded-md border border-border-subtle bg-subtle/35">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute h-20 w-48 border border-primary/25 bg-card/70 will-change-transform"
            style={{
              transform: `translate3d(${shiftX.toFixed(1)}px, ${shiftY.toFixed(1)}px, 0) scale3d(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)}, 1)`,
            }}
          >
            <span
              className="absolute -top-px -left-px size-2 border-t-2 border-l-2 border-primary transition-opacity duration-150"
              style={{ opacity: isActive ? 1 : 0.45 }}
            />
            <span
              className="absolute -top-px -right-px size-2 border-t-2 border-r-2 border-primary transition-opacity duration-150"
              style={{ opacity: isActive ? 1 : 0.45 }}
            />
            <span
              className="absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-primary transition-opacity duration-150"
              style={{ opacity: isActive ? 1 : 0.45 }}
            />
            <span
              className="absolute -bottom-px -right-px size-2 border-b-2 border-r-2 border-primary transition-opacity duration-150"
              style={{ opacity: isActive ? 1 : 0.45 }}
            />
          </div>

          <div
            className="relative z-10 flex items-baseline gap-1.5 font-mono tabular-nums transition-transform duration-150"
            style={{
              transform: isActive ? "scale(1.02)" : "scale(1)",
            }}
          >
            <span className="text-xl font-semibold tracking-tight text-foreground">{roundedW}</span>
            <span className="text-xs text-muted-foreground">×</span>
            <span className="text-xl font-semibold tracking-tight text-foreground">{roundedH}</span>
            <span className="ml-0.5 text-2xs text-muted-foreground">px</span>
          </div>
        </div>

        <Input
          type="text"
          aria-label="Test virtual keyboard resize"
          placeholder="Focus to test virtual keyboard…"
          className="font-mono text-xs"
        />
      </CardContent>

      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col gap-0.5 px-3.5 py-2">
          <span className="text-2xs font-medium tracking-wider text-muted-foreground uppercase">
            Offset (X, Y)
          </span>
          <span className="font-mono text-xs font-medium text-foreground tabular-nums">
            {roundedOffsetX}, {roundedOffsetY}px
          </span>
        </div>
        <div className="flex flex-col gap-0.5 px-3.5 py-2">
          <span className="text-2xs font-medium tracking-wider text-muted-foreground uppercase">
            Page Top
          </span>
          <span className="font-mono text-xs font-medium text-foreground tabular-nums">
            {roundedPageTop}px
          </span>
        </div>
      </div>
    </Card>
  );
}
