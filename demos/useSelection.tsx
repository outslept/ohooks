"use client";

import { useState } from "react";
import { cn } from "cn";
import { Check, CheckSquare, Minus, RotateCcw, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useSelection } from "@/hooks/useSelection";

const FILES = ["useSelection.ts", "useBoolean.ts", "useStorage.ts", "useMedia.ts"] as const;

type FileItem = (typeof FILES)[number];
const MODES = ["multi", "single"] as const;
type SelectionMode = (typeof MODES)[number];

export default function UseSelectionDemo() {
  const [mode, setMode] = useState<SelectionMode>("multi");
  const multiple = mode === "multi";

  const {
    selectedKeys,
    isSelected,
    isAllSelected,
    isPartiallySelected,
    isNoneSelected,
    toggle,
    toggleAll,
    selectRange,
    clear,
    setSelectedKeys,
  } = useSelection<FileItem>(FILES, {
    defaultValue: ["useSelection.ts"],
    multiple,
  });

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between">
          <div
            role="group"
            aria-label="Selection mode"
            className="inline-flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {MODES.map((m) => {
              const active = mode === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m);
                    if (m === "single" && selectedKeys.length > 1) {
                      setSelectedKeys([selectedKeys[0]]);
                    }
                  }}
                  className={cn(
                    "rounded-[3px] px-2 py-0.5 font-mono text-2xs font-medium capitalize transition-all",
                    active
                      ? "bg-control text-foreground shadow-control"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-md border border-border-subtle bg-subtle/35 p-2.5">
          <div className="grid grid-cols-2 gap-1.5">
            {FILES.map((file) => {
              const checked = isSelected(file);
              return (
                <button
                  key={file}
                  type="button"
                  onClick={() => toggle(file)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-sm border px-2 py-1.5 font-mono text-2xs font-medium transition-all active:scale-[0.98]",
                    checked
                      ? "border-primary/40 bg-primary/10 text-primary shadow-control"
                      : "border-border-subtle bg-card/80 text-muted-foreground hover:bg-control hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-3.5 shrink-0 items-center justify-center rounded-[3px] border transition-colors",
                      checked
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-subtle/60",
                    )}
                  >
                    {checked && <Check className="size-2.5" />}
                  </span>
                  <span className="truncate">{file}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t border-border-subtle pt-2 font-mono text-3xs tabular-nums text-muted-foreground">
            <span className="truncate">
              {selectedKeys.length > 0
                ? `[ ${selectedKeys.map((k) => `"${k}"`).join(", ")} ]`
                : "[]"}
            </span>
            <span className="shrink-0 pl-2">
              <strong className="text-foreground">{selectedKeys.length}</strong>/{FILES.length}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t">
        <Button
          variant="primary"
          size="compact"
          leadingIcon={isAllSelected ? CheckSquare : isPartiallySelected ? Minus : Square}
          onClick={toggleAll}
          disabled={!multiple}
          className="flex-1"
        >
          Toggle All
        </Button>
        <Button
          variant="secondary"
          size="compact"
          onClick={() => selectRange(FILES[0], FILES[2])}
          disabled={!multiple}
        >
          Range 1–3
        </Button>
        <Button
          variant="tertiary"
          size="icon-compact"
          onClick={clear}
          disabled={isNoneSelected}
          aria-label="Clear selection"
        >
          <RotateCcw />
        </Button>
      </CardFooter>
    </Card>
  );
}
