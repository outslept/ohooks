"use client";

import { useRef, useState } from "react";
import { cn } from "cn";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { useMap } from "@/hooks/useMap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

const KEYS = ["cache", "retry", "timeout", "workers"] as const;
type ConfigKey = (typeof KEYS)[number];

const INITIAL_ENTRIES: ReadonlyArray<readonly [ConfigKey, number]> = [
  ["cache", 12],
  ["retry", 3],
  ["workers", 4],
];

export default function UseMapDemo() {
  const [map, { set, remove, clear, reset, get, has }] = useMap<ConfigKey, number>(INITIAL_ENTRIES);
  const [activeKey, setActiveKey] = useState<ConfigKey>("cache");
  const frameRef = useRef<HTMLDivElement>(null);

  const pulseFrame = () => {
    if (
      typeof window !== "undefined" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      frameRef.current?.animate(
        [
          { transform: "scale3d(0.98, 0.98, 1)", opacity: 0.8 },
          { transform: "scale3d(1, 1, 1)", opacity: 1 },
        ],
        { duration: 180, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
      );
    }
  };

  const incrementKey = (key: ConfigKey) => {
    const current = get(key) ?? 0;
    set(key, current + 1);
    setActiveKey(key);
    pulseFrame();
  };

  const toggleKeyPresence = (key: ConfigKey) => {
    if (has(key)) {
      remove(key);
    } else {
      set(key, 1);
    }
    setActiveKey(key);
    pulseFrame();
  };

  const activeVal = get(activeKey);

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between gap-2">
          <div
            role="group"
            aria-label="Active map key"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {KEYS.map((key) => {
              const isSelected = activeKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveKey(key)}
                  className={cn(
                    "rounded-[3px] px-1.5 py-0.5 font-mono text-2xs transition-all",
                    isSelected
                      ? "bg-control text-foreground shadow-control"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {key}
                </button>
              );
            })}
          </div>
        </div>

        <div
          ref={frameRef}
          className="flex flex-col gap-2 rounded-md border border-border-subtle bg-subtle/35 p-2.5"
        >
          <div className="flex items-center justify-between gap-2 border-b border-border-subtle pb-1.5 font-mono text-2xs">
            <span className="text-muted-foreground">get(&quot;{activeKey}&quot;)</span>
            <Badge
              variant={activeVal !== undefined ? "accent" : "secondary"}
              size="compact"
              className="tabular-nums"
            >
              {activeVal !== undefined ? activeVal : "undefined"}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {KEYS.map((key) => {
              const present = has(key);
              const val = get(key);
              const isFocused = activeKey === key;

              return (
                <div
                  key={key}
                  className={cn(
                    "flex items-center justify-between rounded-md border px-2 py-1.5 font-mono text-2xs tabular-nums transition-colors",
                    present
                      ? isFocused
                        ? "border-primary/40 bg-primary/10 text-foreground"
                        : "border-border-subtle bg-card text-foreground shadow-control"
                      : "border-dashed border-border-subtle bg-subtle/20 text-muted-foreground/60",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => incrementKey(key)}
                    className="truncate text-left transition-transform duration-150 ease-out active:scale-[0.97]"
                  >
                    <span>{key}: </span>
                    <strong className={present ? "text-primary" : "text-muted-foreground/50"}>
                      {val ?? "—"}
                    </strong>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleKeyPresence(key)}
                    aria-label={present ? `Remove ${key}` : `Set ${key}`}
                    className="ml-1.5 inline-flex size-4 shrink-0 items-center justify-center rounded-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {present ? "×" : "+"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>

      <CardFooter className="justify-between gap-1.5 border-t">
        <Button
          variant="primary"
          size="compact"
          onClick={() => incrementKey(activeKey)}
          leadingIcon={Plus}
          className="font-mono"
        >
          {activeKey}
        </Button>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-compact"
            onClick={() => {
              reset();
              pulseFrame();
            }}
            aria-label="Reset map"
          >
            <RotateCcw className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-compact"
            onClick={() => {
              clear();
              pulseFrame();
            }}
            disabled={map.size === 0}
            aria-label="Clear map"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
