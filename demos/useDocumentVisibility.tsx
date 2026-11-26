"use client";

import { useEffect, useRef, useState } from "react";
import { EyeIcon, EyeOffIcon, RotateCcwIcon } from "lucide-react";
import { cn } from "cn";

import { useDocumentVisibility } from "@/hooks/useDocumentVisibility";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export default function UseDocumentVisibilityDemo() {
  const visibility = useDocumentVisibility();
  const [awayCount, setAwayCount] = useState(0);
  const [lastAwayMs, setLastAwayMs] = useState<number | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const prevVisibilityRef = useRef<DocumentVisibilityState>(visibility);
  const hiddenSinceRef = useRef<number | null>(null);
  const simTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const restoreNativeVisibility = () => {
    if (simTimerRef.current !== null) {
      clearTimeout(simTimerRef.current);
      simTimerRef.current = null;
    }
    if (typeof document !== "undefined") {
      delete (document as { visibilityState?: DocumentVisibilityState }).visibilityState;
      document.dispatchEvent(new Event("visibilitychange"));
    }
    setIsSimulating(false);
  };

  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleVisibilityChange = () => {
      const current = document.visibilityState;
      const prev = prevVisibilityRef.current;
      if (prev === current) return;
      prevVisibilityRef.current = current;

      if (current === "hidden") {
        hiddenSinceRef.current = performance.now();
        setAwayCount((c) => c + 1);
      } else if (current === "visible" && hiddenSinceRef.current !== null) {
        const elapsed = Math.max(0, performance.now() - hiddenSinceRef.current);
        hiddenSinceRef.current = null;
        setLastAwayMs(Math.round(elapsed));
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (simTimerRef.current !== null) {
        clearTimeout(simTimerRef.current);
      }
      if (typeof document !== "undefined") {
        delete (document as { visibilityState?: DocumentVisibilityState }).visibilityState;
      }
    };
  }, []);

  const triggerSimulatedAway = () => {
    if (typeof document === "undefined") return;
    if (isSimulating) {
      restoreNativeVisibility();
      return;
    }

    setIsSimulating(true);
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "hidden",
    });
    document.dispatchEvent(new Event("visibilitychange"));

    simTimerRef.current = setTimeout(() => {
      restoreNativeVisibility();
    }, 1200);
  };

  const resetStats = () => {
    setAwayCount(0);
    setLastAwayMs(null);
  };

  const isVisible = visibility === "visible";

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant={isVisible ? "accent" : "warning"}
            size="compact"
            className="font-mono uppercase"
          >
            {visibility}
          </Badge>
        </div>

        <div
          className={cn(
            "flex items-center justify-between rounded-md border px-3.5 py-3 transition-all duration-150",
            isVisible ? "border-border-subtle bg-subtle/35" : "border-warning/30 bg-warning/5",
          )}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "flex size-7 items-center justify-center rounded-sm border transition-colors",
                isVisible
                  ? "border-border-subtle bg-control text-foreground"
                  : "border-warning/30 bg-warning/10 text-warning",
              )}
            >
              {isVisible ? <EyeIcon className="size-3.5" /> : <EyeOffIcon className="size-3.5" />}
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-xs font-semibold text-foreground">
                {isVisible ? "Document Visible" : "Document Hidden"}
              </span>
              <span className="font-mono text-3xs text-muted-foreground">
                Switch browser tab or simulate
              </span>
            </div>
          </div>
        </div>
      </CardContent>

      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            Away Count
          </span>
          <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
            {awayCount}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            Last Away Duration
          </span>
          <span className="font-mono text-xs font-semibold text-primary tabular-nums">
            {lastAwayMs !== null ? `${(lastAwayMs / 1000).toFixed(1)}s` : "—"}
          </span>
        </div>
      </div>

      <CardFooter className="border-t">
        <Button
          variant={isSimulating ? "secondary" : "primary"}
          size="compact"
          onClick={triggerSimulatedAway}
          className="flex-1"
        >
          {isSimulating ? (
            <>
              <EyeIcon />
              Restore Visible
            </>
          ) : (
            <>
              <EyeOffIcon />
              Simulate Away (1.2s)
            </>
          )}
        </Button>
        <Button variant="tertiary" size="compact" onClick={resetStats} disabled={awayCount === 0}>
          <RotateCcwIcon />
          Reset
        </Button>
      </CardFooter>
    </Card>
  );
}
