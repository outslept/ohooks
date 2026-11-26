"use client";

import { useRef, useState } from "react";
import { ArrowDownIcon, Loader2Icon, RotateCcwIcon } from "lucide-react";
import { cn } from "cn";

import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

const PAGE_SIZE = 6;
const MAX_ITEMS = 100;

const MODE_OPTIONS = [
  { label: "auto", enabled: true },
  { label: "manual", enabled: false },
] as const;

function createPage(start: number, count: number): number[] {
  return Array.from({ length: count }, (_, i) => start + i + 1);
}

export default function UseInfiniteScrollDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<number[]>(() => createPage(0, PAGE_SIZE));
  const [autoEnabled, setAutoEnabled] = useState<boolean>(true);

  const hasMore = items.length < MAX_ITEMS;

  const appendNextPage = async () => {
    await new Promise((resolve) => setTimeout(resolve, 450));
    setItems((prev) =>
      prev.length >= MAX_ITEMS ? prev : [...prev, ...createPage(prev.length, PAGE_SIZE)],
    );
  };

  const { isLoading, loadMore } = useInfiniteScroll(sentinelRef, appendNextPage, {
    root: rootRef,
    rootMargin: "0px 0px 24px 0px",
    hasMore,
    enabled: autoEnabled,
  });

  const handleManualLoad = () => {
    if (isLoading || !hasMore) return;
    if (autoEnabled) {
      void loadMore();
    } else {
      void appendNextPage();
    }
  };

  const handleReset = () => {
    setItems(createPage(0, PAGE_SIZE));
    rootRef.current?.scrollTo({ top: 0 });
  };

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between gap-2">
          <div
            role="group"
            aria-label="Infinite scroll observer mode"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {MODE_OPTIONS.map((option) => {
              const active = autoEnabled === option.enabled;
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setAutoEnabled(option.enabled)}
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
          ref={rootRef}
          className="flex h-36 flex-col gap-1.5 overflow-y-auto overscroll-contain rounded-md border border-border-subtle bg-subtle/35 p-2"
        >
          {items.map((num) => (
            <div
              key={num}
              className="flex items-center justify-between rounded-sm border border-border-subtle bg-card px-2.5 py-1.5 font-mono text-2xs tabular-nums"
            >
              <span className="font-medium text-foreground">
                Item #{String(num).padStart(2, "0")}
              </span>
              <Badge variant="code" size="compact">
                batch {Math.ceil(num / PAGE_SIZE)}
              </Badge>
            </div>
          ))}

          <div
            ref={sentinelRef}
            className="flex min-h-7 shrink-0 items-center justify-center font-mono text-2xs text-muted-foreground tabular-nums"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-1.5 text-primary">
                <Loader2Icon className="size-3 animate-spin" />
                loading batch...
              </span>
            ) : hasMore ? (
              <span>{autoEnabled ? "↓ sentinel active" : "auto paused"}</span>
            ) : (
              <span>end of list ({MAX_ITEMS})</span>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t">
        <Button
          variant="primary"
          size="compact"
          loading={isLoading}
          onClick={handleManualLoad}
          disabled={!hasMore || isLoading}
          className="flex-1 font-mono"
        >
          <ArrowDownIcon />
          loadMore()
        </Button>
        <Button
          variant="tertiary"
          size="compact"
          onClick={handleReset}
          disabled={items.length === PAGE_SIZE && !isLoading}
        >
          <RotateCcwIcon />
          Reset
        </Button>
      </CardFooter>
    </Card>
  );
}
