"use client";

import { useRef, useState } from "react";
import { cn } from "cn";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

const THRESHOLDS = Array.from({ length: 21 }, (_, i) => Number((i / 20).toFixed(2)));

const MODE_OPTIONS = [
  { label: "live", freeze: false },
  { label: "freeze", freeze: true },
] as const;

export default function UseIntersectionObserverDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const [freezeOnceVisible, setFreezeOnceVisible] = useState(false);

  const entry = useIntersectionObserver(targetRef, {
    root: rootRef,
    threshold: THRESHOLDS,
    freezeOnceVisible,
  });

  const isVisible = Boolean(entry?.isIntersecting);
  const ratio = entry?.intersectionRatio ?? 0;
  const percent = Math.round(ratio * 100);
  const isFrozen = isVisible && freezeOnceVisible;

  const toggleScrollPosition = () => {
    const root = rootRef.current;
    const target = targetRef.current;
    if (!root || !target) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior: ScrollBehavior = prefersReduced ? "auto" : "smooth";

    if (isVisible && !isFrozen) {
      root.scrollTo({ top: 0, behavior });
    } else {
      const targetCenter = target.offsetTop - root.clientHeight / 2 + target.clientHeight / 2;
      root.scrollTo({
        top: root.scrollTop > 40 ? 0 : Math.max(0, targetCenter),
        behavior,
      });
    }
  };

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between gap-2">
          <div
            role="group"
            aria-label="Observer freeze mode"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {MODE_OPTIONS.map((option) => {
              const active = freezeOnceVisible === option.freeze;
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setFreezeOnceVisible(option.freeze)}
                  className={cn(
                    "rounded-[3px] px-1.5 py-0.5 font-mono text-2xs transition-all",
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
          ref={rootRef}
          className="relative h-36 w-full overflow-y-auto rounded-md border border-border-subtle bg-subtle/35 px-3"
        >
          <div className="flex h-28 items-center justify-center">
            <span className="font-mono text-2xs text-muted-foreground tabular-nums">
              ↓ scroll viewport ({percent}%)
            </span>
          </div>

          <div className="flex justify-center py-2">
            <div
              ref={targetRef}
              className={cn(
                "flex w-full flex-col gap-2 rounded-md border px-3 py-2.5 transition-colors duration-150",
                isVisible
                  ? "border-primary/40 bg-card shadow-control"
                  : "border-border-subtle bg-card/60",
              )}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <Badge
                  variant={isFrozen ? "warning" : isVisible ? "accent" : "secondary"}
                  size="compact"
                  className="font-mono uppercase"
                >
                  {isFrozen ? "frozen" : isVisible ? "visible" : "hidden"}
                </Badge>
                <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
                  {percent}%
                </span>
              </div>

              <div className="h-1 w-full overflow-hidden rounded-full bg-subtle">
                <div
                  className="h-full w-full origin-left bg-primary"
                  style={{
                    transform: `scale3d(${ratio}, 1, 1)`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="h-28" />
        </div>
      </CardContent>

      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="text-2xs font-medium tracking-wider text-muted-foreground uppercase">
            Intersecting
          </span>
          <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
            {String(isVisible)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="text-2xs font-medium tracking-wider text-muted-foreground uppercase">
            Ratio
          </span>
          <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
            {percent}%
          </span>
        </div>
      </div>

      <CardFooter className="border-t">
        <Button
          variant="secondary"
          size="compact"
          onClick={toggleScrollPosition}
          className="w-full"
        >
          {isVisible && !isFrozen ? "Scroll to top" : "Scroll to target"}
        </Button>
      </CardFooter>
    </Card>
  );
}
