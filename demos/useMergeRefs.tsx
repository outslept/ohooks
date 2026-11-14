"use client"

import { useCallback, useRef, useState } from "react"
import { cn } from "cn"
import { Crosshair } from "lucide-react"
import { useMergeRefs } from "@/hooks/useMergeRefs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const CALLBACK_MODES = [
  { id: "attached", label: "3rd: on" },
  { id: "detached", label: "3rd: off" },
] as const

type CallbackMode = (typeof CALLBACK_MODES)[number]["id"]

export default function UseMergeRefsDemo() {
  const focusRef = useRef<HTMLInputElement>(null)
  const pulseRef = useRef<HTMLInputElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)

  const [mode, setMode] = useState<CallbackMode>("attached")
  const [dimensions, setDimensions] = useState<{ w: number; h: number } | null>(
    null
  )
  const [cleanupRuns, setCleanupRuns] = useState(0)
  const [value, setValue] = useState("merged-node-01")

  const measureCallbackRef = useCallback((node: HTMLInputElement | null) => {
    if (!node) return
    const rect = node.getBoundingClientRect()
    setDimensions({
      w: Math.round(rect.width),
      h: Math.round(rect.height),
    })

    return () => {
      setDimensions(null)
      setCleanupRuns((count) => count + 1)
    }
  }, [])

  const mergedRef = useMergeRefs<HTMLInputElement>(
    focusRef,
    pulseRef,
    mode === "attached" ? measureCallbackRef : null
  )

  const triggerFocusAndPulse = () => {
    focusRef.current?.focus()
    focusRef.current?.select()

    if (
      typeof window !== "undefined" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      pulseRef.current?.animate(
        [
          { transform: "scale3d(0.97, 0.97, 1)" },
          { transform: "scale3d(1, 1, 1)" },
        ],
        { duration: 180, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }
      )
    }
  }

  const handleModeChange = (nextMode: CallbackMode) => {
    if (nextMode === mode) return
    setMode(nextMode)

    if (
      typeof window !== "undefined" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      frameRef.current?.animate(
        [
          { transform: "scale3d(0.98, 0.98, 1)", opacity: 0.8 },
          { transform: "scale3d(1, 1, 1)", opacity: 1 },
        ],
        { duration: 180, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }
      )
    }
  }

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">

        <div className="flex items-center justify-between gap-2">
          <div
            role="group"
            aria-label="Callback ref attachment state"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {CALLBACK_MODES.map((item) => {
              const isSelected = mode === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleModeChange(item.id)}
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
          className="flex flex-col gap-2.5 rounded-md border border-border-subtle bg-subtle/35 p-3"
        >
          <Input
            ref={mergedRef}
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            aria-label="Merged ref target input"
            className="h-7 text-center font-mono text-xs"
          />

          <div className="flex items-center justify-between gap-1.5">
            <Badge variant="code" size="compact">
              ref[0]: focus
            </Badge>
            <Badge variant="code" size="compact">
              ref[1]: pulse
            </Badge>
            <Badge
              variant={mode === "attached" ? "accent" : "secondary"}
              size="compact"
            >
              ref[2]: {mode === "attached" ? "cb" : "null"}
            </Badge>
          </div>
        </div>
      </CardContent>


      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="text-2xs font-medium tracking-wider text-muted-foreground uppercase">
            Callback Ref
          </span>
          <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
            {dimensions ? `${dimensions.w}×${dimensions.h}px` : "cleaned up"}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="text-2xs font-medium tracking-wider text-muted-foreground uppercase">
            Cleanups
          </span>
          <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
            {cleanupRuns}
          </span>
        </div>
      </div>

      <CardFooter className="border-t">
        <Button
          variant="primary"
          size="compact"
          onClick={triggerFocusAndPulse}
          leadingIcon={Crosshair}
          className="w-full"
        >
          Focus via RefObject
        </Button>
      </CardFooter>
    </Card>
  )
}
