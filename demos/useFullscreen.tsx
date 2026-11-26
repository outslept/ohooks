"use client";

import { useRef, useState } from "react";
import { MaximizeIcon, MinimizeIcon } from "lucide-react";
import { cn } from "cn";

import { useFullscreen } from "@/hooks/useFullscreen";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

const TARGET_OPTIONS = [
  { label: "element", mode: "element" },
  { label: "document", mode: "document" },
] as const;

type TargetMode = (typeof TARGET_OPTIONS)[number]["mode"];

export default function UseFullscreenDemo() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [targetMode, setTargetMode] = useState<TargetMode>("element");
  const [enterCount, setEnterCount] = useState<number>(0);

  const { isFullscreen, isSupported, enter, exit, toggle } = useFullscreen(
    targetMode === "element" ? cardRef : undefined,
    {
      onEnter: () => setEnterCount((c) => c + 1),
    },
  );

  return (
    <Card
      ref={cardRef}
      className="w-full max-w-80 fullscreen:m-auto fullscreen:max-w-md fullscreen:justify-center"
    >
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between gap-2">
          <div
            role="group"
            aria-label="Fullscreen target"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {TARGET_OPTIONS.map((option) => {
              const active = targetMode === option.mode;
              return (
                <button
                  key={option.mode}
                  type="button"
                  onClick={() => {
                    if (isFullscreen) {
                      void exit();
                    }
                    setTargetMode(option.mode);
                  }}
                  className={cn(
                    "rounded-[3px] px-1.5 py-0.5 font-mono text-3xs font-medium transition-all",
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
          className={cn(
            "flex items-center justify-between rounded-md border px-3.5 py-3 transition-colors",
            isFullscreen ? "border-primary/35 bg-primary/5" : "border-border-subtle bg-subtle/35",
          )}
        >
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
              Viewport State
            </span>
            <span className="font-mono text-sm font-semibold text-foreground uppercase">
              {isFullscreen ? "Fullscreen Active" : "Standard Window"}
            </span>
          </div>

          <Badge variant={isFullscreen ? "accent" : "secondary"} size="compact">
            {targetMode}
          </Badge>
        </div>
      </CardContent>

      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            API Supported
          </span>
          <span className="font-mono text-xs font-medium text-foreground tabular-nums">
            {String(isSupported)}
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
          variant="primary"
          size="compact"
          onClick={() => void toggle()}
          disabled={!isSupported}
          className="flex-1 font-mono"
        >
          {isFullscreen ? <MinimizeIcon /> : <MaximizeIcon />}
          toggle()
        </Button>
        <Button
          variant="secondary"
          size="compact"
          onClick={() => void enter()}
          disabled={!isSupported || isFullscreen}
          className="font-mono"
        >
          enter()
        </Button>
        <Button
          variant="tertiary"
          size="compact"
          onClick={() => void exit()}
          disabled={!isSupported || !isFullscreen}
          className="font-mono"
        >
          exit()
        </Button>
      </CardFooter>
    </Card>
  );
}
