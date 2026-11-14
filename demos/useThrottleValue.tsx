"use client"

import { useState } from "react"
import { cn } from "cn"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useThrottleValue } from "@/hooks/useThrottleValue"

const WAIT_OPTIONS = [100, 250, 500] as const

export default function UseThrottleValueDemo() {
  const [waitIdx, setWaitIdx] = useState(1)
  const wait = WAIT_OPTIONS[waitIdx]

  const [value, setValue] = useState(50)
  const [throttledValue] = useThrottleValue(value, wait)

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between">

          <div
            role="group"
            aria-label="Throttle wait interval"
            className="inline-flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {WAIT_OPTIONS.map((ms, idx) => {
              const active = idx === waitIdx
              return (
                <button
                  key={ms}
                  type="button"
                  onClick={() => setWaitIdx(idx)}
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

        <div className="flex flex-col gap-2.5 rounded-md border border-border-subtle bg-subtle/35 p-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between font-mono text-3xs tracking-wider text-muted-foreground uppercase">
              <span>Live Input</span>
              <span className="tabular-nums text-foreground">{value}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-subtle">
              <div
                className="h-full w-full origin-left bg-muted-foreground/45 will-change-transform"
                style={{
                  transform: `scale3d(${(value / 100).toFixed(3)}, 1, 1)`,
                }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between font-mono text-3xs tracking-wider text-primary uppercase">
              <span>Throttled ({wait}ms)</span>
              <span className="font-semibold tabular-nums">
                {throttledValue}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-subtle">
              <div
                className="h-full w-full origin-left bg-primary transition-transform duration-150 ease-out will-change-transform motion-reduce:transition-none"
                style={{
                  transform: `scale3d(${(throttledValue / 100).toFixed(3)}, 1, 1)`,
                }}
              />
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center gap-3 border-t">
        <span className="font-mono text-2xs text-muted-foreground">0%</span>
        <input
          type="range"
          min={0}
          max={100}
          aria-label="Live input value"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-subtle accent-primary"
        />
        <span className="font-mono text-2xs text-muted-foreground">100%</span>
      </CardFooter>
    </Card>
  )
}
