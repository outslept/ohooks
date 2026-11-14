"use client"

import { useState } from "react"
import { Lock, Sun, Unlock } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useWakeLock } from "@/hooks/useWakeLock"

const REACQUIRE_OPTIONS = [
  { label: "true", value: true },
  { label: "false", value: false },
] as const

export default function UseWakeLockDemo() {
  const [enabled, setEnabled] = useState(false)
  const [reacquireIdx, setReacquireIdx] = useState(0)
  const reacquireOnVisible = REACQUIRE_OPTIONS[reacquireIdx].value

  const { isSupported, isLocked, error } = useWakeLock(enabled, {
    reacquireOnVisible,
  })

  const statusKey = error
    ? "error"
    : !isSupported
      ? "unsupported"
      : isLocked
        ? "locked"
        : "released"

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between">

          <div className="flex items-center gap-1.5">
            <span className="font-mono text-2xs text-muted-foreground">
              reacquire
            </span>
            <div
              role="group"
              aria-label="Reacquire wake lock on visibility change"
              className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
            >
              {REACQUIRE_OPTIONS.map((opt, idx) => {
                const active = idx === reacquireIdx
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setReacquireIdx(idx)}
                    className={cn(
                      "rounded-[3px] px-1.5 py-0.5 font-mono text-2xs transition-colors",
                      active
                        ? "bg-control text-foreground shadow-control"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-1 rounded-md border border-border-subtle bg-subtle/35 px-3 py-5 font-mono tabular-nums">
          {statusKey === "locked" && (
            <>
              <div className="flex items-center gap-1.5 text-base font-semibold tracking-tight text-foreground">
                <Sun className="size-4 text-primary" />
                <span>locked</span>
              </div>
              <span className="text-2xs text-muted-foreground">
                screen: awake
              </span>
            </>
          )}

          {statusKey === "released" && (
            <>
              <span className="text-base font-semibold tracking-tight text-foreground">
                released
              </span>
              <span className="text-2xs text-muted-foreground">
                screen: normal sleep
              </span>
            </>
          )}

          {statusKey === "unsupported" && (
            <>
              <span className="text-base font-semibold tracking-tight text-muted-foreground">
                unsupported
              </span>
              <span className="text-2xs text-muted-foreground">
                navigator.wakeLock unavailable
              </span>
            </>
          )}

          {statusKey === "error" && error && (
            <>
              <span className="text-base font-semibold tracking-tight text-destructive">
                error
              </span>
              <span className="max-w-full truncate text-2xs text-muted-foreground">
                {error.message}
              </span>
            </>
          )}
        </div>
      </CardContent>

      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col gap-0.5 px-3.5 py-2">
          <span className="text-2xs font-medium tracking-wider text-muted-foreground uppercase">
            API Support
          </span>
          <span className="font-mono text-xs font-medium text-foreground">
            {isSupported ? "supported" : "unsupported"}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 px-3.5 py-2">
          <span className="text-2xs font-medium tracking-wider text-muted-foreground uppercase">
            On Visible
          </span>
          <span className="font-mono text-xs font-medium text-foreground">
            {reacquireOnVisible ? "reacquire" : "manual"}
          </span>
        </div>
      </div>

      <CardFooter className="border-t">
        <Button
          variant={enabled ? "secondary" : "primary"}
          size="compact"
          className="w-full"
          disabled={!isSupported}
          onClick={() => setEnabled((prev) => !prev)}
          leadingIcon={enabled ? <Unlock /> : <Lock />}
        >
          {enabled ? "Release Wake Lock" : "Acquire Wake Lock"}
        </Button>
      </CardFooter>
    </Card>
  )
}
