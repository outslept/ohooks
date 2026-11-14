"use client"

import { useRef, useState } from "react"
import { cn } from "cn"
import { useInterval } from "@/hooks/useInterval"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

const DELAY_OPTIONS = [
  { label: "null", value: null },
  { label: "200", value: 200 },
  { label: "500", value: 500 },
  { label: "1000", value: 1000 },
] as const

export default function UseIntervalDemo() {
  const [ticks, setTicks] = useState(0)
  const [delay, setDelay] = useState<number | null>(500)
  const lastActiveDelayRef = useRef<number>(500)
  const frameRef = useRef<HTMLDivElement>(null)

  useInterval(() => {
    setTicks((t) => t + 1)

    if (
      frameRef.current &&
      typeof window !== "undefined" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      frameRef.current.animate(
        [
          { transform: "scale3d(1.02, 1.02, 1)" },
          { transform: "scale3d(1, 1, 1)" },
        ],
        {
          duration: 180,
          easing: "cubic-bezier(0.23, 1, 0.32, 1)",
        }
      )
    }
  }, delay)

  const selectDelay = (next: number | null) => {
    if (next !== null) {
      lastActiveDelayRef.current = next
    }
    setDelay(next)
  }

  const toggleRunning = () => {
    setDelay((current) =>
      current === null ? lastActiveDelayRef.current : null
    )
  }

  const isRunning = delay !== null

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">

        <div className="flex items-center justify-between gap-2">

          <div
            role="group"
            aria-label="Interval delay"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {DELAY_OPTIONS.map((option) => {
              const active = delay === option.value
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => selectDelay(option.value)}
                  className={cn(
                    "rounded-[3px] px-1.5 py-0.5 font-mono text-2xs tabular-nums transition-all",
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
          ref={frameRef}
          className="flex flex-col items-center justify-center gap-1.5 rounded-md border border-border-subtle bg-subtle/35 px-4 py-4"
        >
          <Badge
            variant={isRunning ? "accent" : "secondary"}
            size="compact"
            className="tabular-nums"
          >
            {isRunning ? `every ${delay}ms` : "delay: null"}
          </Badge>
          <span className="font-mono text-3xl font-semibold tracking-tight text-foreground tabular-nums">
            {ticks}
          </span>
        </div>
      </CardContent>

      <CardFooter className="gap-2 border-t">
        <Button
          variant={isRunning ? "secondary" : "primary"}
          size="compact"
          onClick={toggleRunning}
          className="flex-1"
        >
          {isRunning ? "Pause" : "Resume"}
        </Button>
        <Button
          variant="ghost"
          size="compact"
          onClick={() => setTicks(0)}
          disabled={ticks === 0}
        >
          Reset
        </Button>
      </CardFooter>
    </Card>
  )
}
