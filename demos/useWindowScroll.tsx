"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowDown, ArrowUp, ArrowUpToLine } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useWindowScroll } from "@/hooks/useWindowScroll"

const THROTTLE_OPTIONS = [0, 100, 300] as const

export default function UseWindowScrollDemo() {
  const [throttleIdx, setThrottleIdx] = useState(0)
  const throttleMs = THROTTLE_OPTIONS[throttleIdx]

  const { x, y, scrollTo } = useWindowScroll({ throttleMs })
  const [isScrolling, setIsScrolling] = useState(false)
  const [maxScroll, setMaxScroll] = useState(1)
  const isFirstRender = useRef(true)

  useEffect(() => {
    const updateMaxScroll = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight
      setMaxScroll(Math.max(1, scrollable))
    }

    updateMaxScroll()
    window.addEventListener("resize", updateMaxScroll, { passive: true })
    return () => window.removeEventListener("resize", updateMaxScroll)
  }, [])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    setIsScrolling(true)
    const id = window.setTimeout(() => setIsScrolling(false), 160)
    return () => window.clearTimeout(id)
  }, [x, y])

  const progress = Math.min(1, Math.max(0, y / maxScroll))
  const translateY = (progress - 0.5) * 32
  const roundedX = Math.round(x)
  const roundedY = Math.round(y)
  const atTop = roundedY <= 0

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
            className="relative flex h-16 w-44 items-center justify-center border border-primary/25 bg-card/75 will-change-transform"
            style={{
              transform: `translate3d(0, ${translateY.toFixed(1)}px, 0)`,
            }}
          >
            <span
              aria-hidden="true"
              className="absolute -top-px -left-px size-2 border-t-2 border-l-2 border-primary transition-opacity duration-150"
              style={{ opacity: isScrolling ? 1 : 0.45 }}
            />
            <span
              aria-hidden="true"
              className="absolute -top-px -right-px size-2 border-t-2 border-r-2 border-primary transition-opacity duration-150"
              style={{ opacity: isScrolling ? 1 : 0.45 }}
            />
            <span
              aria-hidden="true"
              className="absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-primary transition-opacity duration-150"
              style={{ opacity: isScrolling ? 1 : 0.45 }}
            />
            <span
              aria-hidden="true"
              className="absolute -bottom-px -right-px size-2 border-b-2 border-r-2 border-primary transition-opacity duration-150"
              style={{ opacity: isScrolling ? 1 : 0.45 }}
            />

            <div className="flex items-baseline gap-1.5 font-mono tabular-nums">
              <span className="text-2xs text-muted-foreground">y</span>
              <span className="text-xl font-semibold tracking-tight text-foreground">
                {roundedY}
              </span>
              <span className="text-2xs text-muted-foreground">px</span>
            </div>
          </div>
        </div>
      </CardContent>

      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col gap-0.5 px-3.5 py-2">
          <span className="text-2xs font-medium tracking-wider text-muted-foreground uppercase">
            Scroll X
          </span>
          <span className="font-mono text-xs font-medium text-foreground tabular-nums">
            {roundedX}px
          </span>
        </div>
        <div className="flex flex-col gap-0.5 px-3.5 py-2">
          <span className="text-2xs font-medium tracking-wider text-muted-foreground uppercase">
            Progress
          </span>
          <span className="font-mono text-xs font-medium text-foreground tabular-nums">
            {Math.round(progress * 100)}%
          </span>
        </div>
      </div>

      <CardFooter className="gap-1.5 border-t">
        <Button
          variant="secondary"
          size="compact"
          className="flex-1 font-mono tabular-nums"
          disabled={atTop}
          onClick={() =>
            scrollTo({ top: Math.max(0, y - 240), behavior: "smooth" })
          }
          leadingIcon={<ArrowUp />}
        >
          240px
        </Button>
        <Button
          variant="secondary"
          size="compact"
          className="flex-1 font-mono tabular-nums"
          onClick={() => scrollTo({ top: y + 240, behavior: "smooth" })}
          leadingIcon={<ArrowDown />}
        >
          240px
        </Button>
        <Button
          variant="primary"
          size="compact"
          disabled={atTop}
          onClick={() => scrollTo({ top: 0, behavior: "smooth" })}
          leadingIcon={<ArrowUpToLine />}
        >
          Top
        </Button>
      </CardFooter>
    </Card>
  )
}
