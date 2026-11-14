"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "cn"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useWindowSize } from "@/hooks/useWindowSize"

const THROTTLE_OPTIONS = [0, 100, 300] as const

function getBreakpoint(width: number): string {
  if (width >= 1536) return "2xl"
  if (width >= 1280) return "xl"
  if (width >= 1024) return "lg"
  if (width >= 768) return "md"
  if (width >= 640) return "sm"
  return "xs"
}

export default function UseWindowSizeDemo() {
  const [throttleIdx, setThrottleIdx] = useState(0)
  const throttleMs = THROTTLE_OPTIONS[throttleIdx]

  const { width, height } = useWindowSize({ throttleMs })
  const [isResizing, setIsResizing] = useState(false)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    setIsResizing(true)
    const id = window.setTimeout(() => setIsResizing(false), 180)
    return () => window.clearTimeout(id)
  }, [width, height])

  const ratio = height > 0 ? (width / height).toFixed(2) : "—"
  const breakpoint = getBreakpoint(width)

  const scaleX = width > 0 ? Math.min(1, Math.max(0.35, width / 1920)) : 0.75
  const scaleY = height > 0 ? Math.min(1, Math.max(0.4, height / 1080)) : 0.75

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between">

          <div
            role="group"
            aria-label="Throttle interval"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {THROTTLE_OPTIONS.map((ms, idx) => {
              const active = idx === throttleIdx
              return (
                <button
                  key={ms}
                  type="button"
                  onClick={() => setThrottleIdx(idx)}
                  className={cn(
                    "rounded-[3px] px-1.5 py-0.5 font-mono text-2xs tabular-nums transition-colors",
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

        <div className="relative flex h-28 w-full items-center justify-center overflow-hidden rounded-md border border-border-subtle bg-subtle/35">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute h-20 w-48 border border-primary/25 bg-card/70 will-change-transform"
            style={{
              transform: `scale3d(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)}, 1)`,
            }}
          >
            <span
              className="absolute -top-px -left-px size-2 border-t-2 border-l-2 border-primary transition-opacity duration-150"
              style={{ opacity: isResizing ? 1 : 0.45 }}
            />
            <span
              className="absolute -top-px -right-px size-2 border-t-2 border-r-2 border-primary transition-opacity duration-150"
              style={{ opacity: isResizing ? 1 : 0.45 }}
            />
            <span
              className="absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-primary transition-opacity duration-150"
              style={{ opacity: isResizing ? 1 : 0.45 }}
            />
            <span
              className="absolute -bottom-px -right-px size-2 border-b-2 border-r-2 border-primary transition-opacity duration-150"
              style={{ opacity: isResizing ? 1 : 0.45 }}
            />
          </div>

          <div
            className="relative z-10 flex items-baseline gap-1.5 font-mono tabular-nums transition-transform duration-150"
            style={{
              transform: isResizing ? "scale(1.02)" : "scale(1)",
            }}
          >
            <span className="text-xl font-semibold tracking-tight text-foreground">
              {width}
            </span>
            <span className="text-xs text-muted-foreground">×</span>
            <span className="text-xl font-semibold tracking-tight text-foreground">
              {height}
            </span>
            <span className="ml-0.5 text-2xs text-muted-foreground">px</span>
          </div>
        </div>
      </CardContent>

      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col gap-0.5 px-3.5 py-2">
          <span className="text-2xs font-medium tracking-wider text-muted-foreground uppercase">
            Breakpoint
          </span>
          <div>
            <Badge variant="accent" size="compact">
              {breakpoint}
            </Badge>
          </div>
        </div>
        <div className="flex flex-col gap-0.5 px-3.5 py-2">
          <span className="text-2xs font-medium tracking-wider text-muted-foreground uppercase">
            Aspect Ratio
          </span>
          <span className="font-mono text-xs font-medium text-foreground tabular-nums">
            {ratio}:1
          </span>
        </div>
      </div>
    </Card>
  )
}
