"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { cn } from "cn"
import { Lock, Unlock } from "lucide-react"
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

const GAP_MODES = [
  { id: "true", label: "gap: true", value: true },
  { id: "false", label: "gap: false", value: false },
] as const

function subscribeToBodyStyle(callback: () => void) {
  if (typeof document === "undefined") return () => {}
  const observer = new MutationObserver(callback)
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["style"],
  })
  return () => observer.disconnect()
}

function getBodyOverflowSnapshot(): string {
  return typeof document !== "undefined"
    ? document.body.style.overflow || "visible"
    : "visible"
}

function getServerOverflowSnapshot(): string {
  return "visible"
}

function getBodyPaddingRightSnapshot(): string {
  return typeof document !== "undefined"
    ? document.body.style.paddingRight || "0px"
    : "0px"
}

function getServerPaddingRightSnapshot(): string {
  return "0px"
}

export default function UseLockBodyScrollDemo() {
  const [locked, setLocked] = useState(false)
  const [reserveGap, setReserveGap] = useState(true)
  const frameRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)

  useLockBodyScroll(locked, { reserveScrollBarGap: reserveGap })

  const overflow = useSyncExternalStore(
    subscribeToBodyStyle,
    getBodyOverflowSnapshot,
    getServerOverflowSnapshot
  )
  const paddingRight = useSyncExternalStore(
    subscribeToBodyStyle,
    getBodyPaddingRightSnapshot,
    getServerPaddingRightSnapshot
  )

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (
      typeof window !== "undefined" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      frameRef.current?.animate(
        [
          { transform: "scale3d(0.97, 0.97, 1)", opacity: 0.75 },
          { transform: "scale3d(1, 1, 1)", opacity: 1 },
        ],
        { duration: 200, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }
      )
    }
  }, [locked, reserveGap])

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">

        <div className="flex items-center justify-between gap-2">

          <div
            role="group"
            aria-label="Reserve scrollbar gap"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {GAP_MODES.map((item) => {
              const isSelected = reserveGap === item.value
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setReserveGap(item.value)}
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
          ref={frameRef}
          className="flex flex-col items-center justify-center gap-2 rounded-md border border-border-subtle bg-subtle/35 px-4 py-4"
        >
          <div className="flex items-center gap-2">
            {locked ? (
              <Lock className="size-4 text-warning" />
            ) : (
              <Unlock className="size-4 text-success" />
            )}
            <span className="font-mono text-lg font-semibold tracking-tight text-foreground">
              {locked ? "LOCKED" : "UNLOCKED"}
            </span>
          </div>
          <Badge variant={locked ? "warning" : "accent"} size="compact">
            {locked ? "scroll disabled" : "scroll active"}
          </Badge>
        </div>
      </CardContent>


      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="text-2xs font-medium tracking-wider text-muted-foreground uppercase">
            Overflow
          </span>
          <span className="font-mono text-xs font-semibold text-foreground">
            {overflow}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="text-2xs font-medium tracking-wider text-muted-foreground uppercase">
            Padding Right
          </span>
          <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
            {paddingRight}
          </span>
        </div>
      </div>

      <CardFooter className="border-t">
        <Button
          variant={locked ? "secondary" : "primary"}
          size="compact"
          onClick={() => setLocked((prev) => !prev)}
          leadingIcon={
            locked ? (
              Unlock
            ) : (
              Lock
            )
          }
          className="w-full"
        >
          {locked ? "Unlock scroll" : "Lock scroll"}
        </Button>
      </CardFooter>
    </Card>
  )
}
