"use client";

import * as React from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useAnimationFrame } from "@/hooks/useAnimationFrame";
import { Card, CardAction, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "cn";

const TICKS = Array.from({ length: 60 }, (_, i) => i);
const FPS_OPTIONS: Array<{ label: string; value: number | undefined }> = [
  { label: "MAX", value: undefined },
  { label: "60", value: 60 },
  { label: "30", value: 30 },
  { label: "15", value: 15 },
];

export function UseAnimationFrameDemo() {
  const [fpsLimit, setFpsLimit] = React.useState<number | undefined>(undefined);
  const [time, setTime] = React.useState(0);
  const [deltaTime, setDeltaTime] = React.useState(0);
  const [frames, setFrames] = React.useState(0);

  const { isActive, toggle, stop } = useAnimationFrame(
    ({ deltaTime: dt }) => {
      setTime((prev) => prev + dt);
      setDeltaTime(dt);
      setFrames((prev) => prev + 1);
    },
    { immediate: true, fpsLimit },
  );

  const handleReset = () => {
    stop();
    setTime(0);
    setDeltaTime(0);
    setFrames(0);
  };

  const totalSeconds = time / 1000;
  const wholeSeconds = Math.floor(totalSeconds).toString().padStart(2, "0");
  const centiseconds = Math.floor((time % 1000) / 10)
    .toString()
    .padStart(2, "0");

  const progressAngle = ((time % 6000) / 6000) * 360;
  const activeTickIndex = Math.floor(((time % 6000) / 6000) * 60);
  const fps = deltaTime > 0 ? Math.min(240, Math.round(1000 / deltaTime)) : 0;

  return (
    <Card className="w-full max-w-80">
      <CardHeader className="border-b border-border-subtle py-3">
        <CardAction>
          <div
            role="group"
            aria-label="FPS limit"
            className="inline-flex items-center gap-0.5 rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {FPS_OPTIONS.map((option) => {
              const selected = fpsLimit === option.value;
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setFpsLimit(option.value)}
                  className={cn(
                    "rounded-2xs px-1.5 py-0.5 font-mono text-3xs font-medium tabular-nums outline-none select-none",
                    "transition-colors duration-150 ease-out",
                    selected
                      ? "bg-control text-foreground shadow-control"
                      : "text-muted-foreground pointer-hover:hover:text-foreground",
                    "focus-visible:ring-1 focus-visible:ring-ring",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col items-center justify-center py-6">
        <div className="relative flex size-36 items-center justify-center">
          <svg viewBox="0 0 144 144" className="size-full overflow-visible" aria-hidden="true">
            {TICKS.map((tick) => {
              const angle = tick * 6;
              const isMajor = tick % 5 === 0;
              const isPassed = tick <= activeTickIndex && time > 0;

              return (
                <line
                  key={tick}
                  x1="72"
                  y1={isMajor ? "6" : "8"}
                  x2="72"
                  y2={isMajor ? "13" : "12"}
                  transform={`rotate(${angle} 72 72)`}
                  strokeWidth={isMajor ? "1.25" : "1"}
                  strokeLinecap="round"
                  className={cn(
                    "transition-colors duration-75",
                    isPassed
                      ? "stroke-foreground"
                      : isMajor
                        ? "stroke-border-hover"
                        : "stroke-border",
                  )}
                />
              );
            })}

            <circle
              cx="72"
              cy="72"
              r="52"
              fill="none"
              strokeWidth="1"
              className="stroke-border-subtle"
            />

            <g transform={`rotate(${progressAngle} 72 72)`}>
              <circle
                cx="72"
                cy="20"
                r="2.5"
                className={cn(
                  "transition-colors duration-150",
                  isActive ? "fill-foreground" : "fill-muted-foreground",
                )}
              />
            </g>
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
            <div className="flex items-baseline font-mono tracking-tight tabular-nums">
              <span className="text-2xl font-semibold text-foreground">{wholeSeconds}</span>
              <span className="text-sm font-medium text-muted-foreground">.{centiseconds}s</span>
            </div>
            <span className="mt-0.5 font-mono text-3xs tracking-widest text-muted-foreground uppercase">
              {isActive && fps > 0 ? `${fps} FPS` : "PAUSED"}
            </span>
          </div>
        </div>
      </CardContent>

      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col items-center py-2.5">
          <span className="text-3xs font-medium tracking-wider text-muted-foreground uppercase">
            Delta Time
          </span>
          <span className="mt-0.5 font-mono text-xs font-medium text-foreground tabular-nums">
            {deltaTime.toFixed(1)}
            <span className="ml-0.5 text-2xs text-muted-foreground">ms</span>
          </span>
        </div>
        <div className="flex flex-col items-center py-2.5">
          <span className="text-3xs font-medium tracking-wider text-muted-foreground uppercase">
            Frames
          </span>
          <span className="mt-0.5 font-mono text-xs font-medium text-foreground tabular-nums">
            {frames.toLocaleString()}
          </span>
        </div>
      </div>

      <CardFooter className="border-t">
        <button
          type="button"
          onClick={toggle}
          className={cn(
            "inline-flex h-7 flex-1 items-center justify-center gap-1.5 rounded-md border border-border-subtle bg-control px-3 text-xs font-medium text-foreground shadow-control outline-none select-none",
            "transition-[color,border-color,transform] duration-150 ease-out",
            "pointer-hover:hover:border-border-hover",
            "active:scale-[0.99]",
            "focus-visible:border-border-focus focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          {isActive ? (
            <>
              <Pause className="size-3 text-muted-foreground" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="size-3 text-muted-foreground" />
              <span>Start</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleReset}
          aria-label="Reset timer"
          className={cn(
            "inline-flex h-7 items-center justify-center gap-1.5 rounded-md border border-border-subtle bg-control px-2.5 text-xs font-medium text-muted-foreground shadow-control outline-none select-none",
            "transition-[color,border-color,transform] duration-150 ease-out",
            "pointer-hover:hover:border-border-hover pointer-hover:hover:text-foreground",
            "active:scale-[0.99]",
            "focus-visible:border-border-focus focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          <RotateCcw className="size-3" />
          <span>Reset</span>
        </button>
      </CardFooter>
    </Card>
  );
}

export default UseAnimationFrameDemo;
