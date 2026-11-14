"use client"

import { useState } from "react"
import { RotateCcwIcon } from "lucide-react"
import { cn } from "cn"

import { useHydrated } from "@/hooks/useHydrated"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

const SNAPSHOT_OPTIONS = [
  { label: "client", mode: "client" },
  { label: "ssr fallback", mode: "ssr" },
] as const

type SnapshotMode = (typeof SNAPSHOT_OPTIONS)[number]["mode"]

export default function UseHydratedDemo() {
  const isHydrated = useHydrated()
  const [mode, setMode] = useState<SnapshotMode>("client")
  const [mountCount, setMountCount] = useState(1)

  const effectiveHydrated = mode === "ssr" ? false : isHydrated

  const timeZone = effectiveHydrated
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : "UTC"
  const locale = effectiveHydrated ? navigator.language : "en"
  const dpr = effectiveHydrated ? `${window.devicePixelRatio}x` : "1x"

  return (
    <Card className="w-full max-w-80">
      <CardContent key={mountCount} className="flex flex-col gap-3 pt-4 pb-4">

        <div className="flex items-center justify-between gap-2">

          <div
            role="group"
            aria-label="Hydration snapshot branch"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {SNAPSHOT_OPTIONS.map((option) => {
              const active = mode === option.mode
              return (
                <button
                  key={option.mode}
                  type="button"
                  onClick={() => setMode(option.mode)}
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


        <div className="flex items-center justify-between gap-2 rounded-md border border-border-subtle bg-subtle/35 px-3 py-2.5">
          <span className="font-mono text-2xs text-muted-foreground">
            useHydrated()
          </span>
          <Badge
            variant={effectiveHydrated ? "accent" : "warning"}
            size="compact"
          >
            {String(effectiveHydrated)}
          </Badge>
        </div>


        <div className="grid grid-cols-3 gap-1.5 font-mono tabular-nums">
          <div className="flex flex-col gap-0.5 rounded-md border border-border-subtle bg-subtle/25 px-2.5 py-2">
            <span className="text-3xs tracking-wider text-muted-foreground uppercase">
              TZ
            </span>
            <span className="truncate text-2xs font-semibold text-foreground">
              {timeZone}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 rounded-md border border-border-subtle bg-subtle/25 px-2.5 py-2">
            <span className="text-3xs tracking-wider text-muted-foreground uppercase">
              Locale
            </span>
            <span className="truncate text-2xs font-semibold text-foreground">
              {locale}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 rounded-md border border-border-subtle bg-subtle/25 px-2.5 py-2">
            <span className="text-3xs tracking-wider text-muted-foreground uppercase">
              DPR
            </span>
            <span className="truncate text-2xs font-semibold text-primary">
              {dpr}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="justify-between border-t">
        <span className="font-mono text-2xs text-muted-foreground tabular-nums">
          native: <strong className="text-foreground">{String(isHydrated)}</strong>
        </span>

        <Button
          variant="secondary"
          size="compact"
          onClick={() => {
            setMode("client")
            setMountCount((c) => c + 1)
          }}
          className="font-mono tabular-nums"
        >
          <RotateCcwIcon />
          Remount (#{mountCount})
        </Button>
      </CardFooter>
    </Card>
  )
}
