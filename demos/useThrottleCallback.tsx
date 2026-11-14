"use client"

import { useRef, useState } from "react"
import { cn } from "cn"
import { RotateCcw, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useThrottleCallback } from "@/hooks/useThrottleCallback"

const WAIT_OPTIONS = [300, 600, 1000] as const

export default function UseThrottleCallbackDemo() {
  const [wait, setWait] = useState<number>(600)
  const [rawClicks, setRawClicks] = useState(0)
  const [throttledRuns, setThrottledRuns] = useState(0)
  const [isPending, setIsPending] = useState(false)

  const barRef = useRef<HTMLDivElement>(null)
  const barAnimRef = useRef<Animation | null>(null)

  const animateCooldownBar = (duration: number) => {
    const bar = barRef.current
    if (!bar) return
    barAnimRef.current?.cancel()
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return
    }
    barAnimRef.current = bar.animate(
      [{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }],
      { duration, easing: "linear" }
    )
  }

  const stopCooldownBar = () => {
    barAnimRef.current?.cancel()
  }

  const throttledIncrement = useThrottleCallback(
    () => {
      setThrottledRuns((c) => c + 1)
      setIsPending(false)
      stopCooldownBar()
    },
    wait,
    { leading: true, trailing: true }
  )

  const handleTrigger = () => {
    setRawClicks((c) => c + 1)
    throttledIncrement()
    const pendingNow = throttledIncrement.isPending()
    setIsPending(pendingNow)
    if (pendingNow) {
      animateCooldownBar(wait)
    }
  }

  const handleFlush = () => {
    throttledIncrement.flush()
    setIsPending(throttledIncrement.isPending())
    stopCooldownBar()
  }

  const handleCancel = () => {
    throttledIncrement.cancel()
    setIsPending(false)
    stopCooldownBar()
  }

  const handleReset = () => {
    throttledIncrement.cancel()
    stopCooldownBar()
    setRawClicks(0)
    setThrottledRuns(0)
    setIsPending(false)
  }

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between">

          <div
            role="group"
            aria-label="Throttle interval"
            className="inline-flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {WAIT_OPTIONS.map((ms) => {
              const active = wait === ms
              return (
                <button
                  key={ms}
                  type="button"
                  onClick={() => {
                    handleCancel()
                    setWait(ms)
                  }}
                  className={cn(
                    "rounded-[3px] px-1.5 py-0.5 font-mono text-2xs font-medium tabular-nums transition-all",
                    active
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

        <div className="flex flex-col gap-3 rounded-md border border-border-subtle bg-subtle/35 p-3">
          <div className="grid grid-cols-2 divide-x divide-border-subtle">
            <div className="flex flex-col pr-3">
              <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
                Raw Calls
              </span>
              <span className="font-mono text-2xl font-bold tabular-nums text-foreground">
                {rawClicks}
              </span>
            </div>
            <div className="flex flex-col pl-3">
              <span className="font-mono text-3xs tracking-wider text-primary uppercase">
                Executed
              </span>
              <span className="font-mono text-2xl font-bold tabular-nums text-primary">
                {throttledRuns}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-subtle">
              <div
                ref={barRef}
                className="h-full w-full origin-left scale-x-0 bg-primary"
              />
            </div>
            <div className="flex items-center justify-between font-mono text-3xs tabular-nums text-muted-foreground">
              <span>window: {wait}ms</span>
              <span>suppressed: {Math.max(0, rawClicks - throttledRuns)}</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t">
        <Button
          variant="primary"
          size="compact"
          leadingIcon={<Zap />}
          onClick={handleTrigger}
          className="flex-1"
        >
          Trigger
        </Button>
        <Button
          variant="secondary"
          size="compact"
          onClick={handleFlush}
          disabled={!isPending}
        >
          Flush
        </Button>
        <Button
          variant="secondary"
          size="compact"
          onClick={handleCancel}
          disabled={!isPending}
        >
          Cancel
        </Button>
        <Button
          variant="tertiary"
          size="icon-compact"
          onClick={handleReset}
          disabled={rawClicks === 0}
          aria-label="Reset counters"
        >
          <RotateCcw />
        </Button>
      </CardFooter>
    </Card>
  )
}
