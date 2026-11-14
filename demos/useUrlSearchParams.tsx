"use client"

import { useState } from "react"
import { cn } from "cn"
import { ArrowUpDown, RotateCcw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useUrlSearchParams } from "@/hooks/useUrlSearchParams"

const TAB_OPTIONS = ["hooks", "guides", "api"] as const
const HISTORY_OPTIONS = ["replace", "push"] as const

export default function UseUrlSearchParamsDemo() {
  const [modeIdx, setModeIdx] = useState(0)
  const historyMode = HISTORY_OPTIONS[modeIdx]

  const [params, setParams] = useUrlSearchParams({
    historyMode,
    initialValue: { tab: "hooks", sort: "popular" },
  })

  const queryString = params.toString()
  const currentTab = params.get("tab")
  const currentSort = params.get("sort") ?? "popular"
  const hasParams = queryString.length > 0

  const updateParam = (key: string, value: string) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set(key, value)
      return next
    })
  }

  const toggleSort = () => {
    updateParam("sort", currentSort === "popular" ? "recent" : "popular")
  }

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between">

          <div
            role="group"
            aria-label="History mode"
            className="inline-flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {HISTORY_OPTIONS.map((mode, idx) => {
              const active = idx === modeIdx
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setModeIdx(idx)}
                  className={cn(
                    "rounded-[3px] px-2 py-0.5 font-mono text-2xs font-medium transition-all",
                    active
                      ? "bg-control text-foreground shadow-control"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {mode}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2.5 rounded-md border border-border-subtle bg-subtle/35 p-3 font-mono">
          <div className="flex items-center justify-between">
            <span className="text-3xs tracking-wider text-muted-foreground uppercase">
              Query String
            </span>
            <Badge variant="code" size="compact">
              {historyMode}State
            </Badge>
          </div>

          <div className="truncate rounded-sm border border-border-subtle bg-card/80 px-2.5 py-1.5 text-xs font-semibold text-primary">
            {hasParams ? `?${queryString}` : "?"}
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {TAB_OPTIONS.map((tab) => {
              const active = currentTab === tab
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => updateParam("tab", tab)}
                  className={cn(
                    "rounded-sm border py-1 font-mono text-2xs font-medium transition-all active:scale-[0.98]",
                    active
                      ? "border-primary/40 bg-primary/10 text-primary shadow-control"
                      : "border-border-subtle bg-card/60 text-muted-foreground hover:bg-control hover:text-foreground"
                  )}
                >
                  tab={tab}
                </button>
              )
            })}
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t">
        <Button
          variant="primary"
          size="compact"
          leadingIcon={<ArrowUpDown />}
          onClick={toggleSort}
          className="flex-1 font-mono"
        >
          sort={currentSort}
        </Button>
        <Button
          variant="tertiary"
          size="icon-compact"
          disabled={!hasParams}
          onClick={() => setParams({})}
          aria-label="Clear query parameters"
        >
          <RotateCcw />
        </Button>
      </CardFooter>
    </Card>
  )
}
