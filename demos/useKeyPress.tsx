"use client"

import { useState } from "react"
import { cn } from "cn"
import { useKeyPress } from "@/hooks/useKeyPress"
import { Card, CardContent } from "@/components/ui/card"

const PREVENT_OPTIONS = [
  { label: "preventDefault", value: true },
  { label: "default", value: false },
] as const

export default function UseKeyPressDemo() {
  const [preventDefault, setPreventDefault] = useState<boolean>(true)

  const isShift = useKeyPress("shift")
  const isEnter = useKeyPress("Enter", { preventDefault })
  const isUp = useKeyPress(["ArrowUp", "w"], { preventDefault })

  const keys = [
    {
      id: "shift",
      label: "Shift",
      sub: "shift",
      eventKey: "Shift",
      active: isShift,
    },
    {
      id: "enter",
      label: "Enter ↵",
      sub: "Enter",
      eventKey: "Enter",
      active: isEnter,
    },
    {
      id: "up",
      label: "↑ / W",
      sub: "ArrowUp, w",
      eventKey: "ArrowUp",
      active: isUp,
    },
  ]

  const activeCount = Number(isShift) + Number(isEnter) + Number(isUp)

  const dispatchKey = (type: "keydown" | "keyup", key: string) => {
    window.dispatchEvent(
      new KeyboardEvent(type, {
        key,
        shiftKey: key === "Shift" ? type === "keydown" : isShift,
        bubbles: true,
        cancelable: true,
      })
    )
  }

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">

        <div className="flex items-center justify-between gap-2">

          <div
            role="group"
            aria-label="Prevent default behavior"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {PREVENT_OPTIONS.map((option) => {
              const active = preventDefault === option.value
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setPreventDefault(option.value)}
                  className={cn(
                    "rounded-[3px] px-1.5 py-0.5 font-mono text-2xs transition-all",
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


        <div className="grid grid-cols-3 gap-2 rounded-md border border-border-subtle bg-subtle/35 p-2.5">
          {keys.map((k) => (
            <button
              key={k.id}
              type="button"
              onPointerDown={(e) => {
                e.preventDefault()
                dispatchKey("keydown", k.eventKey)
              }}
              onPointerUp={() => dispatchKey("keyup", k.eventKey)}
              onPointerLeave={() => {
                if (k.active) {
                  dispatchKey("keyup", k.eventKey)
                }
              }}
              onPointerCancel={() => dispatchKey("keyup", k.eventKey)}
              style={{
                transform: k.active
                  ? "translate3d(0, 1.5px, 0) scale3d(0.97, 0.97, 1)"
                  : "translate3d(0, 0, 0) scale3d(1, 1, 1)",
              }}
              className={cn(
                "flex flex-col items-center justify-center rounded-md border px-2 py-3 select-none transition-[transform,border-color,background-color,color] duration-150 ease-out motion-reduce:transition-none",
                k.active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border-subtle bg-card text-foreground shadow-control hover:bg-subtle/80"
              )}
            >
              <span className="font-mono text-xs font-semibold tabular-nums">
                {k.label}
              </span>
              <span className="mt-1 font-mono text-2xs text-muted-foreground tabular-nums">
                {k.active ? "pressed" : k.sub}
              </span>
            </button>
          ))}
        </div>
      </CardContent>


      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="text-2xs font-medium tracking-wider text-muted-foreground uppercase">
            Held Keys
          </span>
          <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
            {activeCount} / 3
          </span>
        </div>
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="text-2xs font-medium tracking-wider text-muted-foreground uppercase">
            Event Mode
          </span>
          <span className="font-mono text-xs font-semibold text-foreground">
            {preventDefault ? "prevent" : "default"}
          </span>
        </div>
      </div>
    </Card>
  )
}
