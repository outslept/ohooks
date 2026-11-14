"use client"

import { useRef, useState } from "react"
import { ShieldAlert } from "lucide-react"
import { cn } from "cn"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useOnClickOutside } from "@/hooks/useOnClickOutside"

export default function UseOnClickOutsideDemo() {
  const boxRef = useRef<HTMLDivElement>(null)
  const ignoreButtonRef = useRef<HTMLButtonElement>(null)

  const [outsideCount, setOutsideCount] = useState(0)
  const [insideCount, setInsideCount] = useState(0)
  const [lastEvent, setLastEvent] = useState<"inside" | "outside" | "idle">(
    "idle"
  )

  useOnClickOutside(
    boxRef,
    () => {
      setOutsideCount((c) => c + 1)
      setLastEvent("outside")
    }
  )

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between">
          <Badge
            variant={
              lastEvent === "outside"
                ? "warning"
                : lastEvent === "inside"
                  ? "accent"
                  : "secondary"
            }
            size="compact"
          >
            {lastEvent}
          </Badge>
        </div>

        <div
          ref={boxRef}
          onClick={() => {
            setInsideCount((c) => c + 1)
            setLastEvent("inside")
          }}
          className={cn(
            "flex h-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed px-4 text-center transition-colors select-none",
            lastEvent === "inside"
              ? "border-primary/60 bg-primary/5"
              : "border-border-subtle bg-subtle/35 hover:bg-subtle/60"
          )}
        >
          <span className="font-mono text-xs font-medium text-foreground">
            Protected Target Zone
          </span>
          <span className="text-2xs text-muted-foreground">
            Click inside vs anywhere outside this box
          </span>
        </div>
      </CardContent>

      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col gap-0.5 px-3.5 py-2">
          <span className="text-2xs font-medium tracking-wider text-muted-foreground uppercase">
            Inside Clicks
          </span>
          <span className="font-mono text-xs font-medium text-foreground tabular-nums">
            {insideCount}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 px-3.5 py-2">
          <span className="text-2xs font-medium tracking-wider text-muted-foreground uppercase">
            Outside Clicks
          </span>
          <span className="font-mono text-xs font-medium text-foreground tabular-nums">
            {outsideCount}
          </span>
        </div>
      </div>

      <CardFooter className="gap-1.5 border-t">
        <Button
          ref={ignoreButtonRef}
          variant="secondary"
          size="compact"
          leadingIcon={ShieldAlert}
          className="flex-1"
        >
          Ignored Button
        </Button>
        <Button
          variant="ghost"
          size="compact"
          onClick={() => {
            setInsideCount(0)
            setOutsideCount(0)
            setLastEvent("idle")
          }}
        >
          Reset
        </Button>
      </CardFooter>
    </Card>
  )
}
