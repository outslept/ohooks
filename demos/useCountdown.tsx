"use client"

import { useState } from "react"
import { PauseIcon, PlayIcon, RotateCcwIcon } from "lucide-react"

import { useCountdown } from "@/hooks/useCountdown"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {cn} from "cn"

const COUNT_START = 15
const INTERVAL_OPTIONS = [
  { value: 1000, label: "1000ms" },
  { value: 200, label: "200ms" },
] as const

export default function UseCountdownDemo() {
  const [intervalMs, setIntervalMs] = useState<number>(1000)
  const { count, isRunning, start, pause, reset } = useCountdown({
    countStart: COUNT_START,
    countStop: 0,
    intervalMs,
  })

  const progress = count / COUNT_START
  const isComplete = count === 0

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between gap-2">
          <div
            role="group"
            aria-label="Tick interval"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {INTERVAL_OPTIONS.map((option) => {
              const active = intervalMs === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setIntervalMs(option.value)}
                  className={cn(
                    " rounded-[3px] px-1.5 py-0.5 font-mono text-3xs font-medium tabular-nums transition-all",
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

        <div className="flex flex-col gap-2.5 rounded-md border border-border-subtle bg-subtle/35 px-3.5 py-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-2xl font-semibold tracking-tight text-foreground tabular-nums">
              00:{String(count).padStart(2, "0")}
            </span>

            <Badge
              variant={
                isRunning ? "default" : isComplete ? "accent" : "outline"
              }
              className="font-mono uppercase"
            >
              {isRunning ? "Running" : isComplete ? "Done" : "Paused"}
            </Badge>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full border border-border-subtle/60 bg-subtle">
            <div
              className={cn(
                "h-full w-full origin-left transition-transform duration-150 ease-out motion-reduce:transition-none",
                isRunning ? "bg-success" : "bg-primary"
              )}
              style={{
                transform: `scale3d(${progress}, 1, 1)`,
              }}
            />
          </div>
        </div>
      </CardContent>

      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            Remaining
          </span>
          <span className="font-mono text-xs font-medium text-foreground tabular-nums">
            {count}s / {COUNT_START}s
          </span>
        </div>
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            Step Interval
          </span>
          <span className="font-mono text-xs font-medium text-foreground tabular-nums">
            {intervalMs}ms
          </span>
        </div>
      </div>

      <CardFooter className="border-t">
        <Button
          variant={isRunning ? "secondary" : "primary"}
          size="compact"
          onClick={isRunning ? pause : start}
          disabled={isComplete}
          className="flex-1"
        >
          {isRunning ? (
            <>
              <PauseIcon />
              Pause
            </>
          ) : (
            <>
              <PlayIcon />
              Start
            </>
          )}
        </Button>
        <Button
          variant="tertiary"
          size="compact"
          onClick={reset}
          disabled={!isRunning && count === COUNT_START}
        >
          <RotateCcwIcon />
          Reset
        </Button>
      </CardFooter>
    </Card>
  )
}
