"use client";

import { useRef, useState } from "react";
import { cn } from "cn";
import { Sparkles, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useTextSelection } from "@/hooks/useTextSelection";

const SCOPES = ["scoped", "global"] as const;
type ScopeMode = (typeof SCOPES)[number];

export default function UseTextSelectionDemo() {
  const [scope, setScope] = useState<ScopeMode>("scoped");
  const passageRef = useRef<HTMLParagraphElement>(null);

  const { text, rect } = useTextSelection(scope === "scoped" ? passageRef : undefined);

  const trimmed = text.trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
  const hasSelection = text.length > 0;
  const rectWidth = rect ? Math.round(rect.width) : 0;
  const rectHeight = rect ? Math.round(rect.height) : 0;

  const selectSamplePhrase = () => {
    const el = passageRef.current;
    const textNode = el?.firstChild;
    if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return;

    const content = textNode.textContent ?? "";
    const targetPhrase = "declarative primitives";
    const startIndex = content.indexOf(targetPhrase);
    if (startIndex === -1) return;

    const range = document.createRange();
    range.setStart(textNode, startIndex);
    range.setEnd(textNode, startIndex + targetPhrase.length);

    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(range);
    document.dispatchEvent(new Event("selectionchange"));
  };

  const clearSelection = () => {
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    document.dispatchEvent(new Event("selectionchange"));
  };

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between">
          <div
            role="group"
            aria-label="Selection target scope"
            className="inline-flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {SCOPES.map((mode) => {
              const active = scope === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setScope(mode)}
                  className={cn(
                    "rounded-[3px] px-2 py-0.5 font-mono text-2xs font-medium capitalize transition-all",
                    active
                      ? "bg-control text-foreground shadow-control"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {mode}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-md border border-border-subtle bg-subtle/35 p-3">
          <p
            ref={passageRef}
            className="text-xs leading-relaxed text-foreground selection:bg-primary/20 selection:text-primary"
          >
            React hooks compose browser APIs into declarative primitives with live bounding client
            rect coordinates.
          </p>

          <div className="flex items-center justify-between gap-2 border-t border-border-subtle pt-2 font-mono text-2xs">
            <span
              className={cn(
                "truncate",
                hasSelection ? "font-medium text-primary" : "text-muted-foreground",
              )}
            >
              {hasSelection ? `"${text}"` : "No active selection"}
            </span>
            <Badge variant="code" size="compact" className="shrink-0 tabular-nums">
              {rectWidth}×{rectHeight}px
            </Badge>
          </div>
        </div>
      </CardContent>

      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col gap-0.5 px-4 py-2.5">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            Characters
          </span>
          <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
            {text.length}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 px-4 py-2.5">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            Words
          </span>
          <span className="font-mono text-xs font-semibold tabular-nums text-primary">
            {wordCount}
          </span>
        </div>
      </div>

      <CardFooter className="border-t">
        <Button
          variant="primary"
          size="compact"
          leadingIcon={<Sparkles />}
          onMouseDown={(e) => e.preventDefault()}
          onClick={selectSamplePhrase}
          className="flex-1"
        >
          Select Sample
        </Button>
        <Button
          variant="secondary"
          size="compact"
          leadingIcon={<X />}
          onMouseDown={(e) => e.preventDefault()}
          onClick={clearSelection}
          disabled={!hasSelection}
        >
          Clear
        </Button>
      </CardFooter>
    </Card>
  );
}
