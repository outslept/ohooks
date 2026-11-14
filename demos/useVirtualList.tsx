"use client"

import { useMemo, useRef, useState } from "react"
import { cn } from "cn"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useVirtualList } from "@/hooks/useVirtualList"

const OVERSCAN_OPTIONS = [0, 4, 10] as const
const JUMP_TARGETS = [0, 500, 5000, 9999] as const
const ROW_HEIGHT = 32

export default function UseVirtualListDemo() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [overscanIdx, setOverscanIdx] = useState(1)
  const overscan = OVERSCAN_OPTIONS[overscanIdx]

  const allRows = useMemo(
    () =>
      Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        label: `row_${String(i).padStart(4, "0")}`,
        latency: `${((i * 17) % 90) + 10}ms`,
      })),
    []
  )

  const { virtualItems, wrapperProps, scrollToIndex } = useVirtualList(
    allRows,
    {
      containerTarget: containerRef,
      itemHeight: ROW_HEIGHT,
      overscan,
    }
  )

  const firstIdx = virtualItems[0]?.index ?? 0
  const lastIdx = virtualItems[virtualItems.length - 1]?.index ?? 0

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between">

          <div className="flex items-center gap-1.5">
            <span className="font-mono text-2xs text-muted-foreground">
              overscan
            </span>
            <div
              role="group"
              aria-label="Overscan count"
              className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
            >
              {OVERSCAN_OPTIONS.map((val, idx) => {
                const active = idx === overscanIdx
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setOverscanIdx(idx)}
                    className={cn(
                      "rounded-[3px] px-1.5 py-0.5 font-mono text-2xs tabular-nums transition-colors",
                      active
                        ? "bg-control text-foreground shadow-control"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {val}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div
          ref={containerRef}
          className="relative h-40 w-full overflow-y-auto rounded-md border border-border-subtle bg-subtle/35 font-mono text-xs tabular-nums"
        >
          <div {...wrapperProps}>
            {virtualItems.map(({ data, index, offsetTop, height }) => (
              <div
                key={data.id}
                style={{
                  height,
                  transform: `translate3d(0, ${offsetTop}px, 0)`,
                }}
                className="absolute inset-x-0 top-0 flex items-center justify-between border-b border-border-subtle/70 bg-card/85 px-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xs text-muted-foreground">
                    #{index}
                  </span>
                  <span className="font-medium text-foreground">
                    {data.label}
                  </span>
                </div>
                <Badge variant="code" size="compact">
                  {data.latency}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col gap-0.5 px-3.5 py-2">
          <span className="text-2xs font-medium tracking-wider text-muted-foreground uppercase">
            DOM Nodes
          </span>
          <span className="font-mono text-xs font-medium text-foreground tabular-nums">
            {virtualItems.length} / 10,000
          </span>
        </div>
        <div className="flex flex-col gap-0.5 px-3.5 py-2">
          <span className="text-2xs font-medium tracking-wider text-muted-foreground uppercase">
            Range
          </span>
          <span className="font-mono text-xs font-medium text-foreground tabular-nums">
            #{firstIdx}–#{lastIdx}
          </span>
        </div>
      </div>

      <CardFooter className="gap-1.5 border-t">
        {JUMP_TARGETS.map((idx) => (
          <Button
            key={idx}
            variant="secondary"
            size="compact"
            className="flex-1 font-mono tabular-nums"
            onClick={() => scrollToIndex(idx, "smooth")}
          >
            #{idx}
          </Button>
        ))}
      </CardFooter>
    </Card>
  )
}
