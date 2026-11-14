"use client"

import { useEffect, useRef, useState } from "react"
import { CheckCheckIcon, XIcon, ZapIcon } from "lucide-react"

import { useDebounceCallback } from "@/hooks/useDebounceCallback"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {cn} from "cn"

type EdgeMode = "trailing" | "leading"

const EDGE_MODES: { value: EdgeMode; label: string }[] = [
  { value: "trailing", label: "trailing" },
  { value: "leading", label: "leading" },
]

const DELAY_MS = 700

export default function UseDebounceCallbackDemo() {
  const [edgeMode, setEdgeMode] = useState<EdgeMode>("trailing")
  const [rawCount, setRawCount] = useState(0)
  const [invokedCount, setInvokedCount] = useState(0)
  const [lastArg, setLastArg] = useState<number | null>(null)
  const [pending, setPending] = useState(false)
  const [pulseKey, setPulseKey] = useState(0)

  const barRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<Animation | null>(null)
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearSyncTimer = () => {
    if (syncTimerRef.current !== null) {
      clearTimeout(syncTimerRef.current)
      syncTimerRef.current = null
    }
  }

  const debouncedTrigger = useDebounceCallback(
    (callNumber: number) => {
      setInvokedCount((c) => c + 1)
      setLastArg(callNumber)
      setPending(false)
      clearSyncTimer()
    },
    DELAY_MS,
    {
      leading: edgeMode === "leading",
      trailing: edgeMode === "trailing",
    }
  )

  useEffect(() => {
    const el = barRef.current
    animRef.current?.cancel()

    if (!el || !pending) {
      return
    }

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (reduced) {
      return
    }

    animRef.current = el.animate(
      [
        { transform: "scale3d(0, 1, 1)" },
        { transform: "scale3d(1, 1, 1)" },
      ],
      {
        duration: DELAY_MS,
        easing: "linear",
      }
    )

    return () => {
      animRef.current?.cancel()
    }
  }, [pending, pulseKey])

  useEffect(() => {
    return () => clearSyncTimer()
  }, [])

  const handleTrigger = () => {
    const next = rawCount + 1
    setRawCount(next)
    debouncedTrigger(next)
    setPending(debouncedTrigger.isPending())
    setPulseKey((k) => k + 1)

    clearSyncTimer()
    syncTimerRef.current = setTimeout(() => {
      setPending(debouncedTrigger.isPending())
    }, DELAY_MS + 16)
  }

  const handleFlush = () => {
    debouncedTrigger.flush()
    setPending(debouncedTrigger.isPending())
    clearSyncTimer()
  }

  const handleCancel = () => {
    debouncedTrigger.cancel()
    setPending(false)
    clearSyncTimer()
  }

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">

        <div className="flex items-center justify-between gap-2">

          <div
            role="group"
            aria-label="Debounce edge mode"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {EDGE_MODES.map((mode) => {
              const active = edgeMode === mode.value
              return (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => {
                    debouncedTrigger.cancel()
                    setPending(false)
                    clearSyncTimer()
                    setEdgeMode(mode.value)
                  }}
                  className={cn(
                    "rounded-[3px] px-1.5 py-0.5 font-mono text-3xs font-medium transition-all",
                    active
                      ? "bg-control text-foreground shadow-control"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {mode.label}
                </button>
              )
            })}
          </div>
        </div>


        <div className="flex flex-col gap-2.5 rounded-md border border-border-subtle bg-subtle/35 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-1.5 font-mono text-xs tabular-nums">
              <span className="text-2xs tracking-wider text-muted-foreground uppercase">
                last arg:
              </span>
              <span className="font-semibold text-foreground">
                {lastArg !== null ? `#${lastArg}` : "—"}
              </span>
            </div>

            <Badge
              variant={pending ? "warning" : "default"}
              className="font-mono uppercase"
            >
              {pending ? "Pending" : "Idle"}
            </Badge>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full border border-border-subtle/60 bg-subtle">
            <div
              ref={barRef}
              className="h-full w-full origin-left bg-primary"
              style={{
                transform: pending ? "scale3d(1, 1, 1)" : "scale3d(0, 1, 1)",
              }}
            />
          </div>
        </div>
      </CardContent>


      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            Raw Calls
          </span>
          <span className="font-mono text-sm font-semibold text-foreground tabular-nums">
            {rawCount}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            Invoked
          </span>
          <span className="font-mono text-sm font-semibold text-primary tabular-nums">
            {invokedCount}
          </span>
        </div>
      </div>

      <CardFooter className="border-t">
        <Button
          variant="primary"
          size="compact"
          onClick={handleTrigger}
          className="flex-1 font-mono"
        >
          <ZapIcon />
          Trigger (+1)
        </Button>
        <Button
          variant="secondary"
          size="compact"
          onClick={handleFlush}
          disabled={!pending || edgeMode === "leading"}
        >
          <CheckCheckIcon />
          Flush
        </Button>
        <Button
          variant="tertiary"
          size="compact"
          onClick={handleCancel}
          disabled={!pending}
        >
          <XIcon />
          Cancel
        </Button>
      </CardFooter>
    </Card>
  )
}
