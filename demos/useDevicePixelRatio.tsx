"use client"

import { useState } from "react"

import { useDevicePixelRatio } from "@/hooks/useDevicePixelRatio"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {cn} from "cn"

const CSS_SIZES = [64, 128, 256] as const

export default function UseDevicePixelRatioDemo() {
  const dpr = useDevicePixelRatio({ defaultValue: 1 })
  const [cssSize, setCssSize] = useState<(typeof CSS_SIZES)[number]>(128)

  const dpi = Math.round(dpr * 96)

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">

        <div className="flex items-center justify-between gap-2">

          <div
            role="group"
            aria-label="CSS reference size"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {CSS_SIZES.map((size) => {
              const active = cssSize === size
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => setCssSize(size)}
                  className={cn(
                    "rounded-[3px] px-1.5 py-0.5 font-mono text-3xs font-medium tabular-nums transition-all",
                    active
                      ? "bg-control text-foreground shadow-control"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {size}px
                </button>
              )
            })}
          </div>
        </div>


        <div className="flex flex-col gap-2 rounded-md border border-border-subtle bg-subtle/35 px-3.5 py-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-2xl font-semibold tracking-tight text-foreground tabular-nums">
              {dpr.toFixed(2)}x
            </span>
            <Badge variant="default" className="font-mono tabular-nums">
              {dpi} DPI
            </Badge>
          </div>

          <p className="font-mono text-2xs text-muted-foreground">
            Zoom browser or move window across displays to observe live DPR changes.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
