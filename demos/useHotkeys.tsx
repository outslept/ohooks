"use client"

import { useRef, useState } from "react"
import { PowerIcon, PowerOffIcon } from "lucide-react"
import { cn } from "cn"

import { useHotkeys } from "@/hooks/useHotkeys"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

const EVENT_OPTIONS = [
  { label: "keydown", value: "keydown" },
  { label: "keyup", value: "keyup" },
] as const

type EventMode = (typeof EVENT_OPTIONS)[number]["value"]

const SHORTCUTS = [
  { combo: "shift+up", label: "Shift + ↑", delta: "+1", key: "ArrowUp" },
  { combo: "shift+down", label: "Shift + ↓", delta: "-1", key: "ArrowDown" },
  { combo: "shift+r", label: "Shift + R", delta: "0", key: "r" },
] as const

export default function UseHotkeysDemo() {
  const [count, setCount] = useState(0)
  const [lastCombo, setLastCombo] = useState<string>("none")
  const [enabled, setEnabled] = useState<boolean>(true)
  const [eventMode, setEventMode] = useState<EventMode>("keydown")
  const frameRef = useRef<HTMLDivElement>(null)

  useHotkeys(
    ["shift+up", "shift+down", "shift+r"],
    (_event, combo) => {
      if (combo === "shift+up") {
        setCount((c) => c + 1)
      } else if (combo === "shift+down") {
        setCount((c) => c - 1)
      } else {
        setCount(0)
      }
      setLastCombo(combo)

      if (
        frameRef.current &&
        typeof window !== "undefined" &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        frameRef.current.animate(
          [
            { transform: "scale3d(0.985, 0.985, 1)" },
            { transform: "scale3d(1, 1, 1)" },
          ],
          {
            duration: 160,
            easing: "cubic-bezier(0.23, 1, 0.32, 1)",
          }
        )
      }
    },
    {
      enabled,
      preventDefault: true,
      event: eventMode,
    }
  )

  const triggerCombo = (key: string) => {
    window.dispatchEvent(
      new KeyboardEvent(eventMode, {
        key,
        shiftKey: true,
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
            aria-label="Keyboard event type"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {EVENT_OPTIONS.map((option) => {
              const active = eventMode === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setEventMode(option.value)}
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


        <div
          ref={frameRef}
          className={cn(
            "flex items-center justify-between rounded-md border border-border-subtle bg-subtle/35 px-3.5 py-3 transition-opacity",
            !enabled && "opacity-55"
          )}
        >
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
              Matched Combo
            </span>
            <Badge
              variant={lastCombo !== "none" ? "accent" : "secondary"}
              size="compact"
            >
              {lastCombo}
            </Badge>
          </div>

          <span className="font-mono text-2xl font-semibold tracking-tight text-foreground tabular-nums">
            {count}
          </span>
        </div>


        <div className="grid grid-cols-3 gap-1.5">
          {SHORTCUTS.map((item) => {
            const isLast = lastCombo === item.combo
            return (
              <Button
                key={item.combo}
                variant={isLast ? "primary" : "secondary"}
                size="compact"
                onClick={() => triggerCombo(item.key)}
                disabled={!enabled}
                className="font-mono text-2xs"
              >
                {item.label}
              </Button>
            )
          })}
        </div>
      </CardContent>

      <CardFooter className="justify-between border-t">
        <span className="font-mono text-2xs text-muted-foreground tabular-nums">
          enabled: <strong className="text-foreground">{String(enabled)}</strong>
        </span>

        <Button
          variant={enabled ? "tertiary" : "primary"}
          size="compact"
          onClick={() => setEnabled((prev) => !prev)}
        >
          {enabled ? (
            <>
              <PowerOffIcon />
              Disable
            </>
          ) : (
            <>
              <PowerIcon />
              Enable
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
