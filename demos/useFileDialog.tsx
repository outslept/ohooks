"use client";

import { useState } from "react";
import { FolderOpenIcon, RotateCcwIcon } from "lucide-react";
import { cn } from "cn";

import { useFileDialog } from "@/hooks/useFileDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

const PRESET_OPTIONS = [
  { label: "* (multi)", accept: "*", multiple: true },
  { label: "image/*", accept: "image/*", multiple: true },
  { label: "single", accept: "*", multiple: false },
] as const;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function UseFileDialogDemo() {
  const [presetIdx, setPresetIdx] = useState<number>(0);
  const [lastEvent, setLastEvent] = useState<"idle" | "selected" | "canceled">("idle");

  const preset = PRESET_OPTIONS[presetIdx];

  const { files, open, reset } = useFileDialog({
    accept: preset.accept,
    multiple: preset.multiple,
    onChange: (list) => {
      setLastEvent(list && list.length > 0 ? "selected" : "idle");
    },
    onCancel: () => {
      setLastEvent("canceled");
    },
  });

  const fileArray = files ? Array.from(files) : [];
  const hasFiles = fileArray.length > 0;
  const totalBytes = fileArray.reduce((sum, f) => sum + f.size, 0);

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between gap-2">
          <div
            role="group"
            aria-label="File dialog preset options"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {PRESET_OPTIONS.map((option, idx) => {
              const active = presetIdx === idx;
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setPresetIdx(idx)}
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

        {hasFiles ? (
          <ul className="flex max-h-28 flex-col gap-1.5 overflow-y-auto rounded-md border border-border-subtle bg-subtle/35 p-2">
            {fileArray.map((file, idx) => (
              <li
                key={`${file.name}-${file.lastModified}-${idx}`}
                className="flex items-center justify-between gap-2 rounded-sm border border-border-subtle bg-card px-2.5 py-1.5 font-mono text-2xs tabular-nums"
              >
                <span className="truncate font-medium text-foreground">{file.name}</span>
                <Badge variant="code" size="compact" className="shrink-0">
                  {formatBytes(file.size)}
                </Badge>
              </li>
            ))}
          </ul>
        ) : (
          <button
            type="button"
            onClick={() => open()}
            className="flex min-h-24 flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-border bg-subtle/35 px-3.5 py-4 text-center transition-colors hover:border-border-hover hover:bg-subtle/55"
          >
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-semibold text-foreground">files: null</span>
              <Badge variant="code" size="compact">
                {preset.accept}
              </Badge>
            </div>
            <span className="font-mono text-2xs text-muted-foreground">
              Click to open native file picker
            </span>
          </button>
        )}
      </CardContent>

      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            Selected Files
          </span>
          <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
            {fileArray.length}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            Total Size
          </span>
          <span className="font-mono text-xs font-semibold text-primary tabular-nums">
            {hasFiles ? formatBytes(totalBytes) : "0 B"}
          </span>
        </div>
      </div>

      <CardFooter className="border-t">
        <Button
          variant="primary"
          size="compact"
          onClick={() => open()}
          className="flex-1 font-mono"
        >
          <FolderOpenIcon />
          open()
        </Button>
        <Button
          variant="tertiary"
          size="compact"
          onClick={() => {
            reset();
            setLastEvent("idle");
          }}
          disabled={!hasFiles && lastEvent === "idle"}
          className="font-mono"
        >
          <RotateCcwIcon />
          reset()
        </Button>
      </CardFooter>
    </Card>
  );
}
