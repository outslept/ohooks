"use client"

import { useRef, useState } from "react"
import { cn } from "cn"
import { ArrowRight, RefreshCw, StepForward } from "lucide-react"
import { usePreviousDistinct } from "@/hooks/usePreviousDistinct"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

const STATUSES = ["Idle", "Queue", "Run", "Done"] as const
type StatusItem = (typeof STATUSES)[number]

export default function UsePreviousDistinctDemo() {
  const [status, setStatus] = useState<StatusItem>("Idle")
  const [sameValueClicks, setSameValueClicks] = useState(0)
  const [renders, setRenders] = useState(1)
  const frameRef = useRef<HTMLDivElement>(null)

  const prevDistinctStatus = usePreviousDistinct(status)

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

  const handleSelect = (next: StatusItem) => {
    setRenders((r) => r + 1)
    if (next === status) {
      setSameValueClicks((c) => c + 1)
    } else {
      setSameValueClicks(0)
      setStatus(next)
      pulseFrame()
    }
  }

  const handleCycleNext = () => {
    const currentIndex = STATUSES.indexOf(status)
    const next = STATUSES[(currentIndex + 1) % STATUSES.length]
    handleSelect(next)
  }

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between gap-2">

          <div
            role="group"
            aria-label="Select status"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {STATUSES.map((item) => {
              const active = status === item
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className={cn(
                    "rounded-[3px] px-1.5 py-0.5 font-mono text-2xs transition-all",
                    active
                      ? "bg-control text-foreground shadow-control"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item}
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
                Prev Distinct
              </span>
              <span className="font-mono text-lg font-semibold text-foreground">
                {prevDistinctStatus ?? "undefined"}
              </span>
            </div>

            <ArrowRight className="size-3.5 text-muted-foreground" />

            <div className="flex flex-col items-end">
              <span className="text-2xs font-medium tracking-wider text-primary uppercase">
                Current
              </span>
              <span className="font-mono text-lg font-semibold text-primary">
                {status}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border-subtle pt-2">
            <Badge variant="code" size="compact" className="tabular-nums">
              renders: {renders}
            </Badge>
            <Badge
              variant={sameValueClicks > 0 ? "warning" : "accent"}
              size="compact"
            >
              Object.is: {sameValueClicks > 0 ? "true (kept)" : "false"}
            </Badge>
          </div>
        </div>
      </CardContent>

      <CardFooter className="gap-2 border-t">
        <Button
          variant="primary"
          size="compact"
          onClick={handleCycleNext}
          leadingIcon={StepForward}
          className="flex-1"
        >
          Next Distinct
        </Button>
        <Button
          variant="secondary"
          size="compact"
          onClick={() => handleSelect(status)}
          leadingIcon={RefreshCw}
          className="flex-1"
        >
          Same Value
        </Button>
      </CardFooter>
    </Card>
  )
}
