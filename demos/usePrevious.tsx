"use client"

import { useRef, useState } from "react"
import { cn } from "cn"
import { ArrowRight, Minus, Plus, RotateCcw } from "lucide-react"
import { usePrevious } from "@/hooks/usePrevious"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

const STEP_OPTIONS = [1, 5, 10] as const

export default function UsePreviousDemo() {
  const [count, setCount] = useState(0)
  const [step, setStep] = useState<(typeof STEP_OPTIONS)[number]>(1)
  const frameRef = useRef<HTMLDivElement>(null)

  const prevCount = usePrevious(count)

  const pulseFrame = () => {
    const el = frameRef.current
    if (!el) return
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return
    }
    el.animate(
      [
        { transform: "scale3d(1.02, 1.02, 1)" },
        { transform: "scale3d(1, 1, 1)" },
      ],
      { duration: 200, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }
    )
  }

  const updateCount = (next: number) => {
    if (next === count) return
    setCount(next)
    pulseFrame()
  }

  const delta = prevCount !== undefined ? count - prevCount : null

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between gap-2">

          <div
            role="group"
            aria-label="Step increment size"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {STEP_OPTIONS.map((s) => {
              const active = step === s
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStep(s)}
                  className={cn(
                    "rounded-[3px] px-1.5 py-0.5 font-mono text-2xs tabular-nums transition-all",
                    active
                      ? "bg-control text-foreground shadow-control"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  ±{s}
                </button>
              )
            })}
          </div>
        </div>

        <div
          ref={frameRef}
          className="flex flex-col gap-2.5 rounded-md border border-border-subtle bg-subtle/35 p-3"
        >
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div className="flex flex-col">
              <span className="text-2xs font-medium tracking-wider text-muted-foreground uppercase">
                Previous
              </span>
              <span className="font-mono text-xl font-semibold text-foreground tabular-nums">
                {prevCount ?? "undefined"}
              </span>
            </div>

            <ArrowRight className="size-3.5 text-muted-foreground" />

            <div className="flex flex-col items-end">
              <span className="text-2xs font-medium tracking-wider text-primary uppercase">
                Current
              </span>
              <span className="font-mono text-xl font-semibold text-primary tabular-nums">
                {count}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border-subtle pt-2">
            <Badge variant="code" size="compact">
              ref: {String(prevCount)}
            </Badge>
            <Badge
              variant={delta !== null ? "accent" : "secondary"}
              size="compact"
              className="tabular-nums"
            >
              Δ: {delta === null ? "—" : delta > 0 ? `+${delta}` : delta}
            </Badge>
          </div>
        </div>
      </CardContent>

      <CardFooter className="gap-1.5 border-t">
        <Button
          variant="primary"
          size="compact"
          onClick={() => updateCount(count + step)}
          leadingIcon={Plus}
          className="flex-1 font-mono tabular-nums"
        >
          Add {step}
        </Button>
        <Button
          variant="secondary"
          size="compact"
          onClick={() => updateCount(count - step)}
          leadingIcon={Minus}
          className="flex-1 font-mono tabular-nums"
        >
          Sub {step}
        </Button>
        <Button
          variant="ghost"
          size="icon-compact"
          onClick={() => updateCount(0)}
          disabled={count === 0}
          aria-label="Reset count to zero"
        >
          <RotateCcw className="size-3.5" />
        </Button>
      </CardFooter>
    </Card>
  )
}
