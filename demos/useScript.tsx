"use client";

import { useState } from "react";
import { cn } from "cn";
import { PartyPopper, RotateCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useScript } from "@/hooks/useScript";

const CONFETTI_CDN =
  "https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js";
const ERROR_CDN = "https://invalid.example.invalid/missing.js";

const SOURCES = [
  { key: "idle", label: "Idle", src: null, shortSrc: "null" },
  {
    key: "cdn",
    label: "CDN",
    src: CONFETTI_CDN,
    shortSrc: "cdn.jsdelivr.net/.../confetti.browser.min.js",
  },
  {
    key: "error",
    label: "Error",
    src: ERROR_CDN,
    shortSrc: "invalid.example.invalid/missing.js",
  },
] as const;

type SourceKey = (typeof SOURCES)[number]["key"];

export default function UseScriptDemo() {
  const [sourceKey, setSourceKey] = useState<SourceKey>("idle");
  const activeSource = SOURCES.find((s) => s.key === sourceKey) ?? SOURCES[0];

  const status = useScript(activeSource.src, {
    removeOnUnmount: true,
  });

  const fireConfetti = () => {
    const win = window as unknown as {
      confetti?: (opts: Record<string, unknown>) => void;
    };
    win.confetti?.({
      particleCount: 65,
      spread: 60,
      origin: { y: 0.65 },
      disableForReducedMotion: true,
    });
  };

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between">
          <div
            role="group"
            aria-label="Script source"
            className="inline-flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {SOURCES.map((item) => {
              const active = sourceKey === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setSourceKey(item.key)}
                  className={cn(
                    "rounded-[3px] px-2 py-0.5 font-mono text-2xs font-medium transition-all",
                    active
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

        <div className="flex flex-col gap-2 rounded-md border border-border-subtle bg-subtle/35 p-3 font-mono">
          <div className="flex items-center justify-between">
            <span className="text-3xs tracking-wider text-muted-foreground uppercase">
              DOM Node
            </span>
            <Badge
              variant={status === "ready" ? "accent" : status === "error" ? "destructive" : "code"}
              size="compact"
            >
              {activeSource.src ? "in <body />" : "unmounted"}
            </Badge>
          </div>

          <div className="truncate rounded-sm border border-border-subtle bg-card/80 px-2 py-1.5 text-2xs text-muted-foreground">
            <span className="text-foreground">&lt;script</span> src=&quot;
            <span className="text-primary">{activeSource.shortSrc}</span>
            &quot; <span className="text-foreground">/&gt;</span>
          </div>

          <div className="flex items-center justify-between text-2xs text-muted-foreground">
            <span>data-status=&quot;{status}&quot;</span>
            <span className="text-foreground">
              {status === "ready"
                ? "window.confetti()"
                : status === "error"
                  ? "onerror fired"
                  : status === "loading"
                    ? "fetching..."
                    : "awaiting src"}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t">
        <Button
          variant="primary"
          size="compact"
          leadingIcon={PartyPopper}
          onClick={fireConfetti}
          disabled={status !== "ready"}
          className="flex-1"
        >
          Fire Confetti
        </Button>
        <Button
          variant="tertiary"
          size="icon-compact"
          onClick={() => setSourceKey("idle")}
          disabled={sourceKey === "idle"}
          aria-label="Unload script"
        >
          <RotateCcw />
        </Button>
      </CardFooter>
    </Card>
  );
}
