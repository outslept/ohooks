"use client"

import { useRef, useState } from "react"
import { cn } from "cn"
import { Plus, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useTextareaAutosize } from "@/hooks/useTextareaAutosize"

const MAX_HEIGHT_OPTIONS = [72, 96, 120] as const
const MIN_HEIGHT = 38

const EXTRA_LINES = [
  "Measures scrollHeight in layout effect",
  "Clamps smoothly at maxHeight bound",
  "Enables overflow-y scroll when full",
  "Recalculates on window resize events",
]

export default function UseTextareaAutosizeDemo() {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [value, setValue] = useState("Auto-growing textarea primitive")
  const [maxHeight, setMaxHeight] = useState<number>(96)
  const [currentHeight, setCurrentHeight] = useState<number>(MIN_HEIGHT)

  const { resize } = useTextareaAutosize(textareaRef, value, {
    minHeight: MIN_HEIGHT,
    maxHeight,
    onResize: (height) => setCurrentHeight(Math.round(height)),
  })

  const lineCount = value ? value.split("\n").length : 1

  const handleAppendLine = () => {
    const nextLine = EXTRA_LINES[(lineCount - 1) % EXTRA_LINES.length]
    setValue((prev) =>
      prev.length > 0
        ? `${prev}\nLine ${lineCount + 1}: ${nextLine}`
        : `Line 1: ${nextLine}`
    )
  }

  const handleReset = () => {
    setValue("")
    resize()
  }

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between">

          <div
            role="group"
            aria-label="Maximum textarea height"
            className="inline-flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {MAX_HEIGHT_OPTIONS.map((px) => {
              const active = maxHeight === px
              return (
                <button
                  key={px}
                  type="button"
                  onClick={() => setMaxHeight(px)}
                  className={cn(
                    "rounded-[3px] px-1.5 py-0.5 font-mono text-2xs font-medium tabular-nums transition-all",
                    active
                      ? "bg-control text-foreground shadow-control"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {px}px
                </button>
              )
            })}
          </div>
        </div>

        <div className="rounded-md border border-border-subtle bg-subtle/35 p-2">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Type or add lines..."
            rows={1}
            className="w-full resize-none rounded-sm border border-border-subtle bg-control px-2.5 py-1.5 font-mono text-xs leading-relaxed text-foreground shadow-field placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none"
          />
        </div>
      </CardContent>

      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col gap-0.5 px-4 py-2.5">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            Lines
          </span>
          <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
            {lineCount} {lineCount === 1 ? "line" : "lines"}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 px-4 py-2.5">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            Height / Max
          </span>
          <span className="font-mono text-xs font-semibold tabular-nums text-primary">
            {currentHeight}px / {maxHeight}px
          </span>
        </div>
      </div>

      <CardFooter className="border-t">
        <Button
          variant="primary"
          size="compact"
          leadingIcon={<Plus />}
          onClick={handleAppendLine}
          className="flex-1"
        >
          Add Line
        </Button>
        <Button
          variant="secondary"
          size="compact"
          leadingIcon={<RotateCcw />}
          onClick={handleReset}
          disabled={value.length === 0}
        >
          Clear
        </Button>
      </CardFooter>
    </Card>
  )
}
