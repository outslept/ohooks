"use client";

import * as React from "react";
import { Check, Copy, RotateCcw } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "cn";

const RESET_OPTIONS = [
  { value: 1500, label: "1500ms" },
  { value: 3000, label: "3000ms" },
] as const;

export function UseCopyToClipboardDemo() {
  const [text, setText] = React.useState("npx shadcn@latest add useCopyToClipboard");
  const [resetInterval, setResetInterval] = React.useState<number>(1500);
  const [copyPulse, setCopyPulse] = React.useState(0);

  const { isCopied, copiedText, copy, reset } = useCopyToClipboard({
    resetInterval,
  });

  const barRef = React.useRef<HTMLDivElement>(null);
  const animRef = React.useRef<Animation | null>(null);

  React.useEffect(() => {
    const el = barRef.current;
    animRef.current?.cancel();

    if (!el || !isCopied) {
      return;
    }

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      return;
    }

    animRef.current = el.animate(
      [{ transform: "scale3d(1, 1, 1)" }, { transform: "scale3d(0, 1, 1)" }],
      {
        duration: resetInterval,
        easing: "linear",
      },
    );

    return () => {
      animRef.current?.cancel();
    };
  }, [isCopied, resetInterval, copyPulse]);

  const handleCopy = async () => {
    await copy(text);
    setCopyPulse((p) => p + 1);
  };

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between">
          <div
            role="group"
            aria-label="Reset interval"
            className="inline-flex items-center gap-0.5 rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {RESET_OPTIONS.map((option) => {
              const selected = resetInterval === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setResetInterval(option.value)}
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
        </div>

        <Input
          size="compact"
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="Text to copy"
          className="font-mono text-xs"
        />

        <div className="relative flex h-11 items-center justify-between gap-2 overflow-hidden rounded-md border border-border-subtle bg-subtle/35 px-3 font-mono text-xs">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="shrink-0 text-2xs text-muted-foreground">buffer:</span>
            <span className="truncate font-medium text-foreground">{copiedText ?? "null"}</span>
          </div>

          <Badge
            size="compact"
            variant={isCopied ? "code" : "secondary"}
            className="shrink-0 font-mono uppercase"
          >
            {isCopied ? "Copied" : "Idle"}
          </Badge>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-border-subtle/50">
            <div
              ref={barRef}
              className="h-full w-full origin-left bg-success"
              style={{
                transform: isCopied ? "scale3d(1, 1, 1)" : "scale3d(0, 1, 1)",
              }}
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t">
        <Button
          size="compact"
          variant={isCopied ? "primary" : "secondary"}
          leadingIcon={isCopied ? Check : Copy}
          onClick={handleCopy}
          className="flex-1"
        >
          {isCopied ? "Copied!" : "Copy text"}
        </Button>

        <Button
          size="compact"
          variant="secondary"
          leadingIcon={RotateCcw}
          disabled={!isCopied && copiedText === null}
          onClick={reset}
        >
          Reset
        </Button>
      </CardFooter>
    </Card>
  );
}

export default UseCopyToClipboardDemo;
