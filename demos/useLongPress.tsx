"use client"

import { useRef, useState } from "react"
import { cn } from "cn"
import { RotateCcw } from "lucide-react"
import { useLongPress } from "@/hooks/useLongPress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

const THRESHOLDS = [400, 700, 1000] as const
type HoldStatus = "idle" | "holding" | "triggered" | "canceled"

export default function UseLongPressDemo() {
  const [threshold, setThreshold] = useState<(typeof THRESHOLDS)[number]>(700)
  const [status, setStatus] = useState<HoldStatus>("idle")
  const [longPressCount, setLongPressCount] = useState(0)
  const [shortTapCount, setShortTapCount] = useState(0)
  const targetRef = useRef<HTMLButtonElement>(null)

  const handlers = useLongPress<HTMLButtonElement>(
    () => {
      setLongPressCount((count) => count + 1)
      setStatus("triggered")

      if (
        typeof window !== "undefined" &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        targetRef.current?.animate(
          [
            { transform: "scale3d(0.95, 0.95, 1)" },
            { transform: "scale3d(1.02, 1.02, 1)" },
            { transform: "scale3d(1, 1, 1)" },
          ],
          { duration: 220, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }
        )
      }
    },
    {
      threshold,
      onStart: () => setStatus("holding"),
      onFinish: () => setStatus("triggered"),
      onCancel: () => setStatus("canceled"),
    }
  )

  const resetAll = () => {
    setLongPressCount(0)
    setShortTapCount(0)
    setStatus("idle")
  }

  const isHolding = status === "holding"
  const isTriggered = status === "triggered"

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">

        <div className="flex items-center justify-between gap-2">

          <div
            role="group"
            aria-label="Hold threshold duration"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {THRESHOLDS.map((ms) => {
              const isSelected = threshold === ms
              return (
                <button
                  key={ms}
                  type="button"
                  onClick={() => {
                    setThreshold(ms)
                    setStatus("idle")
                  }}
                  className={cn(
                    "rounded-[3px] px-1.5 py-0.5 font-mono text-2xs tabular-nums transition-all",
                    isSelected
                      ? "bg-control text-foreground shadow-control"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {ms}ms
                </button>
              )
            })}
          </div>
        </div>


        <button
          ref={targetRef}
          type="button"
          {...handlers}
          onClick={() => setShortTapCount((count) => count + 1)}
          style={{ touchAction: "none" }}
          className={cn(
            "flex w-full cursor-pointer flex-col items-center justify-center gap-2.5 rounded-md border px-4 py-4 select-none transition-[transform,border-color,background-color] duration-150 ease-out",
            isHolding
              ? "scale-[0.98] border-primary/50 bg-primary/5"
              : "border-border-subtle bg-subtle/35 hover:border-border"
          )}
        >
          <Badge
            variant={
              isTriggered
                ? "accent"
                : status === "canceled"
                  ? "warning"
                  : "secondary"
            }
            size="compact"
            className="tabular-nums"
          >
            {isHolding
              ? `Holding (${threshold}ms)…`
              : isTriggered
                ? "Long press fired"
                : status === "canceled"
                  ? "Canceled early"
                  : "Press & hold target"}
          </Badge>

          <div className="h-1 w-full overflow-hidden rounded-full bg-subtle">
            <div
              className={cn(
                "h-full w-full origin-left bg-primary motion-reduce:transition-none",
                isHolding
                  ? "transition-transform ease-linear"
                  : "transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]"
              )}
              style={{
                transform: `scale3d(${isHolding || isTriggered ? 1 : 0}, 1, 1)`,
                transitionDuration: isHolding ? `${threshold}ms` : "150ms",
              }}
            />
          </div>
        </button>
      </CardContent>


      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="text-2xs font-medium tracking-wider text-muted-foreground uppercase">
            Long Press
          </span>
          <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
            {longPressCount}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="text-2xs font-medium tracking-wider text-muted-foreground uppercase">
            Short Tap
          </span>
          <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
            {shortTapCount}
          </span>
        </div>
      </div>

      <CardFooter className="border-t">
        <Button
          variant="secondary"
          size="compact"
          onClick={resetAll}
          disabled={
            longPressCount === 0 && shortTapCount === 0 && status === "idle"
          }
          leadingIcon={RotateCcw}
          className="w-full"
        >
          Reset counters
        </Button>
      </CardFooter>
    </Card>
  )
}
