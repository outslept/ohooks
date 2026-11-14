"use client"

import { useState } from "react"
import { RotateCcwIcon } from "lucide-react"
import { cn } from "cn"

import { useHash } from "@/hooks/useHash"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

const TABS = ["overview", "metrics", "settings"] as const

const HISTORY_OPTIONS = [
  { label: "replace", replace: true },
  { label: "push", replace: false },
] as const

export default function UseHashDemo() {
  const [hash, setHash] = useHash()
  const [replace, setReplace] = useState<boolean>(true)

  const hasHash = Boolean(hash)

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">

        <div className="flex items-center justify-between gap-2">

          <div
            role="group"
            aria-label="Hash history update mode"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {HISTORY_OPTIONS.map((option) => {
              const active = replace === option.replace
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setReplace(option.replace)}
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
            window.location.hash
          </span>
          <Badge variant={hasHash ? "accent" : "secondary"} size="compact">
            {hasHash ? `#${hash}` : "(empty)"}
          </Badge>
        </div>


        <div className="grid grid-cols-3 gap-1.5">
          {TABS.map((tab) => {
            const active = hash === tab
            return (
              <Button
                key={tab}
                variant={active ? "primary" : "secondary"}
                size="compact"
                onClick={() => setHash(tab, { replace })}
                className="font-mono"
              >
                #{tab}
              </Button>
            )
          })}
        </div>
      </CardContent>

      <CardFooter className="justify-between border-t">
        <span className="truncate font-mono text-2xs text-muted-foreground tabular-nums">
          value: <strong className="text-foreground">&quot;{hash}&quot;</strong>
        </span>

        <Button
          variant="tertiary"
          size="compact"
          onClick={() => setHash("", { replace })}
          disabled={!hasHash}
        >
          <RotateCcwIcon />
          Clear
        </Button>
      </CardFooter>
    </Card>
  )
}
