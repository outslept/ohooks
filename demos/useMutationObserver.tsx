"use client"

import { useRef, useState } from "react"
import { cn } from "cn"
import { Code2, Plus } from "lucide-react"
import { useMutationObserver } from "@/hooks/useMutationObserver"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

const VARIANTS = ["ocean", "amber", "violet"] as const
type Variant = (typeof VARIANTS)[number]

const MODES = [
  { id: "all", label: "all" },
  { id: "attr", label: "attr" },
  { id: "off", label: "off" },
] as const

type ModeId = (typeof MODES)[number]["id"]

export default function UseMutationObserverDemo() {
  const targetRef = useRef<HTMLDivElement>(null)
  const [variant, setVariant] = useState<Variant>("ocean")
  const [childCount, setChildCount] = useState(2)
  const [mode, setMode] = useState<ModeId>("all")
  const [mutationCount, setMutationCount] = useState(0)
  const [lastRecord, setLastRecord] = useState("No mutations recorded yet")

  useMutationObserver(
    targetRef,
    (mutations) => {
      const latest = mutations[mutations.length - 1]
      if (!latest) return

      setMutationCount((count) => count + mutations.length)

      if (latest.type === "attributes" && latest.attributeName) {
        const nextVal = targetRef.current?.getAttribute(latest.attributeName)
        const prevVal = latest.oldValue ?? "null"
        setLastRecord(`attr: "${prevVal}" → "${nextVal}"`)
      } else if (latest.type === "childList") {
        const added = latest.addedNodes.length
        const removed = latest.removedNodes.length
        setLastRecord(
          added > 0
            ? `childList: +${added} node (total ${targetRef.current?.querySelectorAll("[data-child]").length ?? 0})`
            : `childList: -${removed} nodes`
        )
      }

      if (
        typeof window !== "undefined" &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        targetRef.current?.animate(
          [
            { transform: "scale3d(0.97, 0.97, 1)", opacity: 0.75 },
            { transform: "scale3d(1, 1, 1)", opacity: 1 },
          ],
          { duration: 200, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }
        )
      }
    },
    {
      enabled: mode !== "off",
      attributes: true,
      attributeOldValue: true,
      attributeFilter: ["data-variant"],
      childList: mode === "all",
      subtree: mode === "all",
    }
  )

  const cycleVariant = () => {
    setVariant((prev) => {
      const idx = VARIANTS.indexOf(prev)
      return VARIANTS[(idx + 1) % VARIANTS.length]
    })
  }

  const cycleChildren = () => {
    setChildCount((count) => (count >= 5 ? 1 : count + 1))
  }

  const isObserving = mode !== "off"

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">

        <div className="flex items-center justify-between gap-2">

          <div
            role="group"
            aria-label="MutationObserver filter mode"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {MODES.map((item) => {
              const isSelected = mode === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMode(item.id)}
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
          ref={targetRef}
          data-variant={variant}
          className="flex flex-col items-center justify-center gap-2.5 rounded-md border border-border-subtle bg-subtle/35 p-3"
        >
          <div className="flex w-full items-center justify-between gap-2">
            <Badge variant="code" size="compact">
              data-variant=&quot;{variant}&quot;
            </Badge>
            <Badge
              variant={isObserving ? "accent" : "secondary"}
              size="compact"
              className="tabular-nums"
            >
              records: {mutationCount}
            </Badge>
          </div>

          <div className="flex items-center gap-1.5 py-1">
            {Array.from({ length: childCount }, (_, idx) => (
              <span
                key={idx}
                data-child={idx}
                className="size-2.5 rounded-xs bg-primary/80"
              />
            ))}
          </div>

          <div className="w-full truncate border-t border-border-subtle pt-2 text-center font-mono text-2xs text-muted-foreground tabular-nums">
            {lastRecord}
          </div>
        </div>
      </CardContent>

      <CardFooter className="gap-2 border-t">
        <Button
          variant="primary"
          size="compact"
          onClick={cycleVariant}
          leadingIcon={Code2}
          className="flex-1"
        >
          Mutate attr
        </Button>
        <Button
          variant="secondary"
          size="compact"
          onClick={cycleChildren}
          leadingIcon={Plus}
          className="flex-1"
        >
          Child node
        </Button>
      </CardFooter>
    </Card>
  )
}
