"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "cn"
import { Crosshair } from "lucide-react"
import { useMouse } from "@/hooks/useMouse"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

const SPACES = [
  { id: "element", label: "element" },
  { id: "client", label: "client" },
  { id: "page", label: "page" },
  { id: "screen", label: "screen" },
] as const

type SpaceId = (typeof SPACES)[number]["id"]

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export default function UseMouseDemo() {
  const stageRef = useRef<HTMLDivElement>(null)
  const [space, setSpace] = useState<SpaceId>("element")
  const [isInside, setIsInside] = useState(false)
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 })

  const {
    x,
    y,
    clientX,
    clientY,
    screenX,
    screenY,
    elementX,
    elementY,
    elementPositionX,
    elementPositionY,
  } = useMouse(stageRef)

  useEffect(() => {
    const el = stageRef.current
    if (!el) return

    const updateSize = () => {
      const rect = el.getBoundingClientRect()
      setStageSize({ width: rect.width, height: rect.height })
    }

    updateSize()

    const observer = new ResizeObserver(updateSize)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const hasMoved = clientX !== 0 || clientY !== 0 || x !== 0 || y !== 0

  let offsetX = 0
  let offsetY = 0

  if (hasMoved && stageSize.width > 0 && stageSize.height > 0) {
    const rawDx = (elementX - stageSize.width / 2) * 0.18
    const rawDy = (elementY - stageSize.height / 2) * 0.18
    offsetX = clamp(rawDx, -28, 28)
    offsetY = clamp(rawDy, -14, 14)
  }

  const coords =
    space === "element"
      ? { x: Math.round(elementX), y: Math.round(elementY), prefix: "el" }
      : space === "client"
        ? { x: Math.round(clientX), y: Math.round(clientY), prefix: "vp" }
        : space === "page"
          ? { x: Math.round(x), y: Math.round(y), prefix: "doc" }
          : { x: Math.round(screenX), y: Math.round(screenY), prefix: "scr" }

  const triggerSamplePoint = () => {
    if (typeof window === "undefined" || !stageRef.current) return
    const rect = stageRef.current.getBoundingClientRect()
    const randX = Math.round(
      rect.left + rect.width * (0.2 + Math.random() * 0.6)
    )
    const randY = Math.round(
      rect.top + rect.height * (0.2 + Math.random() * 0.6)
    )

    const synthetic = new MouseEvent("mousemove", {
      bubbles: true,
      clientX: randX,
      clientY: randY,
      screenX: randX,
      screenY: randY,
    })
    window.dispatchEvent(synthetic)
  }

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between gap-2">
          <div
            role="group"
            aria-label="Coordinate space"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {SPACES.map((item) => {
              const isSelected = space === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSpace(item.id)}
                  className={cn(
                    "rounded-[3px] px-1.5 py-0.5 font-mono text-2xs transition-all",
                    isSelected
                      ? "bg-control text-foreground shadow-control"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>

        <div
          ref={stageRef}
          onPointerEnter={() => setIsInside(true)}
          onPointerLeave={() => setIsInside(false)}
          className="relative flex h-28 w-full cursor-crosshair items-center justify-center overflow-hidden rounded-md border border-border-subtle bg-subtle/35 select-none"
        >
          <div
            style={{
              transform: `translate3d(${offsetX}px, ${offsetY}px, 0)`,
            }}
            className="flex flex-col items-center justify-center gap-1 rounded-md border border-border-subtle bg-card px-4 py-2 shadow-control"
          >
            <div className="flex items-baseline gap-2.5 font-mono text-base font-semibold tracking-tight text-foreground tabular-nums">
              <span>
                <span className="mr-1 text-2xs font-normal text-muted-foreground">
                  {coords.prefix}X
                </span>
                {coords.x}
              </span>
              <span className="text-border">/</span>
              <span>
                <span className="mr-1 text-2xs font-normal text-muted-foreground">
                  {coords.prefix}Y
                </span>
                {coords.y}
              </span>
            </div>
            <Badge
              variant={isInside ? "accent" : "secondary"}
              size="compact"
              className="tabular-nums"
            >
              {isInside ? "tracking" : "hover stage"}
            </Badge>
          </div>
        </div>
      </CardContent>

      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="text-2xs font-medium tracking-wider text-muted-foreground uppercase">
            Element XY
          </span>
          <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
            {Math.round(elementX)}, {Math.round(elementY)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="text-2xs font-medium tracking-wider text-muted-foreground uppercase">
            Origin
          </span>
          <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
            {Math.round(elementPositionX)}, {Math.round(elementPositionY)}
          </span>
        </div>
      </div>

      <CardFooter className="border-t">
        <Button
          variant="secondary"
          size="compact"
          onClick={triggerSamplePoint}
          leadingIcon={Crosshair}
          className="w-full"
        >
          Sample point
        </Button>
      </CardFooter>
    </Card>
  )
}
