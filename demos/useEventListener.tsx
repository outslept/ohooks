"use client"

import { useRef, useState } from "react"
import { KeyboardIcon, RotateCcwIcon } from "lucide-react"
import { cn } from "cn"

import { useEventListener } from "@/hooks/useEventListener"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

const MODE_OPTIONS = [
  { label: "continuous", once: false },
  { label: "once: true", once: true },
] as const

export default function UseEventListenerDemo() {
  const targetRef = useRef<HTMLButtonElement>(null)
  const [once, setOnce] = useState<boolean>(false)
  const [lastEvent, setLastEvent] = useState<{
    type: string
    detail: string
  } | null>(null)
  const [count, setCount] = useState<number>(0)

  const pulseTarget = () => {
    if (
      targetRef.current &&
      typeof window !== "undefined" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      targetRef.current.animate(
        [
          { transform: "scale3d(0.98, 0.98, 1)" },
          { transform: "scale3d(1, 1, 1)" },
        ],
        {
          duration: 160,
          easing: "cubic-bezier(0.23, 1, 0.32, 1)",
        }
      )
    }
  }

  useEventListener(
    "keydown",
    (event) => {
      const keyLabel = event.key === " " ? "Space" : event.key
      setLastEvent({ type: "window:keydown", detail: keyLabel })
      setCount((c) => c + 1)
      pulseTarget()
    },
    undefined,
    { once }
  )

  useEventListener(
    "pointerdown",
    (event) => {
      setLastEvent({
        type: "ref:pointerdown",
        detail: `${Math.round(event.offsetX)}, ${Math.round(event.offsetY)}`,
      })
      setCount((c) => c + 1)
      pulseTarget()
    },
    targetRef,
    { once }
  )

  const dispatchSyntheticKey = () => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Enter",
        bubbles: true,
      })
    )
  }

  const hasCaptured = count > 0

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">

        <div className="flex items-center justify-between gap-2">

          <div
            role="group"
            aria-label="Event listener options"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {MODE_OPTIONS.map((option) => {
              const active = once === option.once
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setOnce(option.once)}
                  className={cn(
                    "rounded-[3px] px-1.5 py-0.5 font-mono text-3xs font-medium transition-all",
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


        <button
          ref={targetRef}
          type="button"
          className="flex flex-col items-center justify-center gap-1.5 rounded-md border border-border-subtle bg-subtle/35 px-4 py-4 text-center transition-colors select-none hover:border-border-hover hover:bg-subtle/55"
        >
          <Badge
            variant={lastEvent ? "accent" : "secondary"}
            size="compact"
            className="font-mono"
          >
            {lastEvent ? lastEvent.type : "tap pad or press any key"}
          </Badge>

          <span className="font-mono text-xl font-semibold tracking-tight text-foreground tabular-nums">
            {lastEvent ? lastEvent.detail : "idle"}
          </span>
        </button>
      </CardContent>


      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            Captured Events
          </span>
          <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
            {count}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            Listener Mode
          </span>
          <span className="font-mono text-xs font-medium text-foreground">
            {once ? "Single-shot" : "Persistent"}
          </span>
        </div>
      </div>

      <CardFooter className="border-t">
        <Button
          variant="primary"
          size="compact"
          onClick={dispatchSyntheticKey}
          className="flex-1"
        >
          <KeyboardIcon />
          Dispatch Enter
        </Button>
        <Button
          variant="tertiary"
          size="compact"
          onClick={() => {
            setCount(0)
            setLastEvent(null)
          }}
          disabled={!hasCaptured}
        >
          <RotateCcwIcon />
          Clear
        </Button>
      </CardFooter>
    </Card>
  )
}
