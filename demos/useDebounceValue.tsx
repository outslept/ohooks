"use client"

import { useEffect, useRef, useState } from "react"
import { CheckCheckIcon, XIcon } from "lucide-react"

import { useDebounceValue } from "@/hooks/useDebounceValue"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {cn} from "cn"

const DELAY_OPTIONS = [
  { value: 500, label: "500ms" },
  { value: 1200, label: "1200ms" },
] as const

export default function UseDebounceValueDemo() {
  const [query, setQuery] = useState("react hooks")
  const [delay, setDelay] = useState<number>(500)
  const [isCancelled, setIsCancelled] = useState(false)

  const [debouncedQuery, controls] = useDebounceValue(query, delay)
  const barRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<Animation | null>(null)

  const isPending = !isCancelled && query !== debouncedQuery
  const showCancelled = isCancelled && query !== debouncedQuery

  useEffect(() => {
    const el = barRef.current
    animRef.current?.cancel()

    if (!el || !isPending) {
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
        duration: delay,
        easing: "linear",
      }
    )

    return () => {
      animRef.current?.cancel()
    }
  }, [query, delay, isPending])

  const handleFlush = () => {
    controls.flush()
    setIsCancelled(false)
  }

  const handleCancel = () => {
    controls.cancel()
    setIsCancelled(true)
  }

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">

        <div className="flex items-center justify-between gap-2">

          <div
            role="group"
            aria-label="Debounce delay"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {DELAY_OPTIONS.map((option) => {
              const active = delay === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setIsCancelled(false)
                    setDelay(option.value)
                  }}
                  className={cn(
                    "rounded-[3px] px-1.5 py-0.5 font-mono text-3xs font-medium tabular-nums transition-all",
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


        <Input
          size="compact"
          type="text"
          value={query}
          onChange={(e) => {
            setIsCancelled(false)
            setQuery(e.target.value)
          }}
          placeholder="Type to debounce..."
          aria-label="Debounced input"
          className="font-mono"
        />


        <div className="flex flex-col gap-2 rounded-md border border-border-subtle bg-subtle/35 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
              Debounced Output
            </span>
            <Badge
              variant={
                isPending
                  ? "warning"
                  : showCancelled
                    ? "destructive"
                    : "default"
              }
              className="font-mono uppercase"
            >
              {isPending ? "Pending" : showCancelled ? "Cancelled" : "Synced"}
            </Badge>
          </div>

          <p className="truncate font-mono text-xs font-semibold text-foreground">
            {debouncedQuery || "—"}
          </p>

          <div className="h-1.5 w-full overflow-hidden rounded-full border border-border-subtle/60 bg-subtle">
            <div
              ref={barRef}
              className="h-full w-full origin-left bg-primary"
              style={{
                transform: isPending ? "scale3d(1, 1, 1)" : "scale3d(0, 1, 1)",
              }}
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t">
        <Button
          variant="primary"
          size="compact"
          onClick={handleFlush}
          disabled={!isPending}
          className="flex-1"
        >
          <CheckCheckIcon />
          Flush
        </Button>
        <Button
          variant="tertiary"
          size="compact"
          onClick={handleCancel}
          disabled={!isPending}
          className="flex-1"
        >
          <XIcon />
          Cancel
        </Button>
      </CardFooter>
    </Card>
  )
}
