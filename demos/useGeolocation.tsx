"use client"

import { useState } from "react"
import { LocateFixedIcon, LocateOffIcon } from "lucide-react"
import { cn } from "cn"

import { useGeolocation } from "@/hooks/useGeolocation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

const ACCURACY_OPTIONS = [
  { label: "standard", highAccuracy: false },
  { label: "highAccuracy", highAccuracy: true },
] as const

export default function UseGeolocationDemo() {
  const [enabled, setEnabled] = useState<boolean>(false)
  const [enableHighAccuracy, setEnableHighAccuracy] = useState<boolean>(false)

  const {
    isSupported,
    loading,
    latitude,
    longitude,
    accuracy,
    error,
  } = useGeolocation({
    enabled,
    enableHighAccuracy,
  })

  const isWatching = enabled && !loading && !error && latitude !== null

  const statusLabel = !isSupported
    ? "unsupported"
    : !enabled
      ? "paused"
      : loading
        ? "locating..."
        : error
          ? "error"
          : "watching"

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              {(isWatching || loading) && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              )}
              <span
                className={cn(
                  "relative inline-flex size-2 rounded-full transition-colors",
                  error
                    ? "bg-destructive"
                    : isWatching
                      ? "bg-success"
                      : loading
                        ? "bg-warning"
                        : "bg-muted-foreground/40"
                )}
              />
            </span>
            <span className="font-mono text-2xs tracking-wider text-muted-foreground uppercase">
              {statusLabel}
            </span>
          </div>

          <div
            role="group"
            aria-label="Geolocation accuracy mode"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {ACCURACY_OPTIONS.map((option) => {
              const active = enableHighAccuracy === option.highAccuracy
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setEnableHighAccuracy(option.highAccuracy)}
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


        <div className="grid grid-cols-3 gap-2 font-mono tabular-nums">
          <div className="flex flex-col gap-0.5 rounded-md border border-border-subtle bg-subtle/35 px-2.5 py-2">
            <span className="text-3xs tracking-wider text-muted-foreground uppercase">
              Lat
            </span>
            <span className="truncate text-xs font-semibold text-foreground">
              {latitude !== null ? latitude.toFixed(4) : "—"}
            </span>
          </div>

          <div className="flex flex-col gap-0.5 rounded-md border border-border-subtle bg-subtle/35 px-2.5 py-2">
            <span className="text-3xs tracking-wider text-muted-foreground uppercase">
              Lng
            </span>
            <span className="truncate text-xs font-semibold text-foreground">
              {longitude !== null ? longitude.toFixed(4) : "—"}
            </span>
          </div>

          <div className="flex flex-col gap-0.5 rounded-md border border-border-subtle bg-subtle/35 px-2.5 py-2">
            <span className="text-3xs tracking-wider text-muted-foreground uppercase">
              Accuracy
            </span>
            <span className="truncate text-xs font-semibold text-primary">
              {accuracy !== null ? `±${Math.round(accuracy)}m` : "—"}
            </span>
          </div>
        </div>

        {error && (
          <div className="flex items-center justify-between gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-2.5 py-1.5">
            <span className="truncate font-mono text-2xs text-destructive">
              {error.message}
            </span>
            <Badge variant="destructive" size="compact">
              Error
            </Badge>
          </div>
        )}
      </CardContent>


      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            Supported
          </span>
          <span className="font-mono text-xs font-medium text-foreground tabular-nums">
            {String(isSupported)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            Watcher Enabled
          </span>
          <span className="font-mono text-xs font-medium text-foreground tabular-nums">
            {String(enabled)}
          </span>
        </div>
      </div>

      <CardFooter className="border-t">
        <Button
          variant={enabled ? "secondary" : "primary"}
          size="compact"
          onClick={() => setEnabled((prev) => !prev)}
          disabled={!isSupported}
          className="w-full"
        >
          {enabled ? (
            <>
              <LocateOffIcon />
              Stop Watching
            </>
          ) : (
            <>
              <LocateFixedIcon />
              Watch Location
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
