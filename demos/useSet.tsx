"use client"

import { useState } from "react"
import { cn } from "cn"
import { Check, Minus, Plus, RotateCcw, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useSet } from "@/hooks/useSet"

const TOPICS = [
  "TypeScript",
  "React 19",
  "SSR",
  "Tailwind",
  "Signals",
  "WASM",
] as const

const PROBE_KEYS = ["TypeScript", "SSR", "WASM"] as const

export default function UseSetDemo() {
  const [set, { add, remove, toggle, clear, reset, has }] = useSet<string>([
    "TypeScript",
    "React 19",
  ])
  const [probe, setProbe] = useState<(typeof PROBE_KEYS)[number]>("TypeScript")

  const items = Array.from(set)
  const nextToAdd = TOPICS.find((t) => !has(t))
  const lastAdded = items[items.length - 1]

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between">

          <div
            role="group"
            aria-label="Inspect set key with has()"
            className="inline-flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {PROBE_KEYS.map((key) => {
              const active = probe === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setProbe(key)}
                  className={cn(
                    "rounded-[3px] px-1.5 py-0.5 font-mono text-2xs font-medium transition-all",
                    active
                      ? "bg-control text-foreground shadow-control"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {key === "TypeScript" ? "TS" : key}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-md border border-border-subtle bg-subtle/35 p-2.5">
          <div className="grid grid-cols-3 gap-1.5">
            {TOPICS.map((topic) => {
              const active = has(topic)
              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => toggle(topic)}
                  className={cn(
                    "inline-flex items-center justify-center gap-1 rounded-sm border px-2 py-1 font-mono text-2xs font-medium transition-all active:scale-[0.98]",
                    active
                      ? "border-primary/40 bg-primary/10 text-primary shadow-control"
                      : "border-border-subtle bg-card/80 text-muted-foreground hover:bg-control hover:text-foreground"
                  )}
                >
                  {active ? (
                    <Check className="size-2.5 shrink-0" />
                  ) : (
                    <Plus className="size-2.5 shrink-0 opacity-60" />
                  )}
                  <span className="truncate">{topic}</span>
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-between border-t border-border-subtle pt-2 font-mono text-3xs tabular-nums text-muted-foreground">
            <span className="truncate">
              {items.length > 0
                ? `Set(${set.size}) { ${items.map((item) => `"${item}"`).join(", ")} }`
                : "Set(0) {}"}
            </span>
            <span className="shrink-0 pl-2">
              <strong className="text-foreground">{set.size}</strong>/
              {TOPICS.length}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t">
        <Button
          variant="primary"
          size="compact"
          leadingIcon={<Plus />}
          onClick={() => {
            if (nextToAdd) add(nextToAdd)
          }}
          disabled={!nextToAdd}
          className="flex-1"
        >
          Add
        </Button>
        <Button
          variant="secondary"
          size="compact"
          leadingIcon={<Minus />}
          onClick={() => {
            if (lastAdded) remove(lastAdded)
          }}
          disabled={!lastAdded}
        >
          Remove
        </Button>
        <Button
          variant="tertiary"
          size="icon-compact"
          onClick={reset}
          aria-label="Reset set to initial values"
        >
          <RotateCcw />
        </Button>
        <Button
          variant="ghost"
          size="icon-compact"
          onClick={clear}
          disabled={set.size === 0}
          aria-label="Clear all set values"
        >
          <Trash2 />
        </Button>
      </CardFooter>
    </Card>
  )
}
