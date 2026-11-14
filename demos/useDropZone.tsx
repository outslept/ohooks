"use client"

import { type DragEvent as ReactDragEvent, useState } from "react"
import { FileCodeIcon, ImageIcon, RotateCcwIcon, UploadIcon } from "lucide-react"
import { cn } from "cn"

import { useDropZone } from "@/hooks/useDropZone"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

type AcceptFilter = "*/*" | "image/*"

const ACCEPT_OPTIONS: { value: AcceptFilter; label: string }[] = [
  { value: "*/*", label: "*/*" },
  { value: "image/*", label: "image/*" },
]

export default function UseDropZoneDemo() {
  const [accept, setAccept] = useState<AcceptFilter>("image/*")
  const [rejectedName, setRejectedName] = useState<string | null>(null)

  const { isOver, isInvalid, files, clearFiles, getRootProps } = useDropZone({
    accept,
    multiple: true,
    onDrop: () => {
      setRejectedName(null)
    },
    onDropRejected: (rejected) => {
      setRejectedName(rejected[0]?.name ?? "file")
    },
  })

  const rootProps = getRootProps()

  const simulateDrop = (name: string, type: string, sizeBytes: number) => {
    if (typeof DataTransfer === "undefined") return
    const dt = new DataTransfer()
    const content = new Uint8Array(sizeBytes)
    dt.items.add(new File([content], name, { type }))

    rootProps.onDrop({
      preventDefault() {},
      stopPropagation() {},
      dataTransfer: dt,
    } as unknown as ReactDragEvent<HTMLElement>)
  }

  const handleClear = () => {
    clearFiles()
    setRejectedName(null)
  }

  const latestFile = files[files.length - 1]
  const hasDanger = isInvalid || rejectedName !== null

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">

        <div className="flex items-center justify-between gap-2">

          <div
            role="group"
            aria-label="Accepted MIME filter"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {ACCEPT_OPTIONS.map((option) => {
              const active = accept === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setAccept(option.value)
                    setRejectedName(null)
                  }}
                  className={cn(
                    "rounded-[3px] px-1.5 py-0.5 font-mono text-3xs font-medium transition-all",
                    active
                      ? "bg-control text-foreground shadow-control"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>


        <div
          {...rootProps}
          className={cn(
            "flex min-h-24 flex-col items-center justify-center gap-1.5 rounded-md border border-dashed px-3.5 py-4 text-center transition-all select-none",
            hasDanger
              ? "border-destructive/50 bg-destructive/5"
              : isOver
                ? "scale-[1.01] border-primary bg-primary/5"
                : "border-border bg-subtle/35"
          )}
        >
          {isOver ? (
            <>
              <Badge
                variant={isInvalid ? "destructive" : "accent"}
                size="compact"
              >
                {isInvalid ? "Invalid MIME" : "Release to Drop"}
              </Badge>
              <span className="font-mono text-2xs text-muted-foreground">
                accept: {accept}
              </span>
            </>
          ) : rejectedName ? (
            <>
              <div className="flex items-center gap-1.5">
                <Badge variant="destructive" size="compact">
                  Rejected
                </Badge>
                <span className="max-w-40 truncate font-mono text-xs font-semibold text-destructive">
                  {rejectedName}
                </span>
              </div>
              <span className="font-mono text-2xs text-muted-foreground">
                requires {accept}
              </span>
            </>
          ) : latestFile ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="max-w-44 truncate font-mono text-xs font-semibold text-foreground">
                  {latestFile.name}
                </span>
                {files.length > 1 && (
                  <Badge variant="accent" size="compact" className="tabular-nums">
                    +{files.length - 1}
                  </Badge>
                )}
              </div>
              <span className="font-mono text-2xs text-muted-foreground tabular-nums">
                {latestFile.type || "unknown"} ·{" "}
                {Math.max(1, Math.round(latestFile.size / 1024))} KB
              </span>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5 text-foreground">
                <UploadIcon className="size-3.5 text-muted-foreground" />
                <span className="font-mono text-xs font-semibold tracking-tight">
                  DROP FILES HERE
                </span>
              </div>
              <span className="font-mono text-2xs text-muted-foreground">
                accept: {accept}
              </span>
            </>
          )}
        </div>
      </CardContent>

      <CardFooter className="border-t">
        <Button
          variant="primary"
          size="compact"
          onClick={() => simulateDrop("frame.png", "image/png", 18432)}
          className="flex-1 font-mono"
        >
          <ImageIcon />
          .png
        </Button>
        <Button
          variant="secondary"
          size="compact"
          onClick={() => simulateDrop("config.json", "application/json", 4096)}
          className="flex-1 font-mono"
        >
          <FileCodeIcon />
          .json
        </Button>
        <Button
          variant="tertiary"
          size="compact"
          onClick={handleClear}
          disabled={files.length === 0 && rejectedName === null}
        >
          <RotateCcwIcon />
          Clear
        </Button>
      </CardFooter>
    </Card>
  )
}
