"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "cn";
import { Wifi, WifiOff } from "lucide-react";
import { useOnline } from "@/hooks/useOnline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

const MODES = [
  { id: "system", label: "System" },
  { id: "online", label: "Online" },
  { id: "offline", label: "Offline" },
] as const;

type ModeId = (typeof MODES)[number]["id"];

function applyOnlineMode(mode: ModeId) {
  if (typeof window === "undefined") return;

  if (mode === "system") {
    delete (window.navigator as { onLine?: boolean }).onLine;
    window.dispatchEvent(new Event(window.navigator.onLine ? "online" : "offline"));
  } else {
    const nextValue = mode === "online";
    Object.defineProperty(window.navigator, "onLine", {
      value: nextValue,
      configurable: true,
    });
    window.dispatchEvent(new Event(nextValue ? "online" : "offline"));
  }
}

export default function UseOnlineDemo() {
  const isOnline = useOnline();
  const [mode, setMode] = useState<ModeId>("system");
  const [transitions, setTransitions] = useState(0);
  const frameRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        delete (window.navigator as { onLine?: boolean }).onLine;
      }
    };
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setTransitions((count) => count + 1);

    if (
      typeof window !== "undefined" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      frameRef.current?.animate(
        [
          { transform: "scale3d(0.97, 0.97, 1)", opacity: 0.75 },
          { transform: "scale3d(1, 1, 1)", opacity: 1 },
        ],
        { duration: 200, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
      );
    }
  }, [isOnline]);

  const selectMode = (nextMode: ModeId) => {
    setMode(nextMode);
    applyOnlineMode(nextMode);
  };

  const toggleConnection = () => {
    selectMode(isOnline ? "offline" : "online");
  };

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between gap-2">
          <div
            role="group"
            aria-label="Network state mode"
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

        <div
          ref={frameRef}
          className="flex flex-col items-center justify-center gap-2 rounded-md border border-border-subtle bg-subtle/35 px-4 py-4"
        >
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="size-4 text-success" />
            ) : (
              <WifiOff className="size-4 text-destructive" />
            )}
            <span className="font-mono text-lg font-semibold tracking-tight text-foreground">
              {isOnline ? "ONLINE" : "OFFLINE"}
            </span>
          </div>
          <Badge variant={isOnline ? "accent" : "destructive"} size="compact">
            {isOnline ? "connected" : "disconnected"}
          </Badge>
        </div>
      </CardContent>

      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="text-2xs font-medium tracking-wider text-muted-foreground uppercase">
            State
          </span>
          <span className="font-mono text-xs font-semibold text-foreground">
            {String(isOnline)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="text-2xs font-medium tracking-wider text-muted-foreground uppercase">
            Transitions
          </span>
          <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
            {transitions}
          </span>
        </div>
      </div>

      <CardFooter className="border-t">
        <Button
          variant={isOnline ? "secondary" : "primary"}
          size="compact"
          onClick={toggleConnection}
          leadingIcon={isOnline ? WifiOff : Wifi}
          className="w-full"
        >
          {isOnline ? "Simulate offline" : "Simulate online"}
        </Button>
      </CardFooter>
    </Card>
  );
}
