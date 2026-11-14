"use client"

import { useRef, useState } from "react"
import { LockIcon, PlusIcon, UnlockIcon } from "lucide-react"
import { cn } from "cn"

import { useInert } from "@/hooks/useInert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const STATE_OPTIONS = [
  { label: "interactive", value: false },
  { label: "inert", value: true },
] as const

export default function UseInertDemo() {
  const [isInert, setIsInert] = useState(false)
  const [text, setText] = useState("Focusable input")
  const [clicks, setClicks] = useState(0)
  const panelRef = useRef<HTMLDivElement>(null)

  useInert(panelRef, isInert)

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">

        <div className="flex items-center justify-between gap-2">

          <div
            role="group"
            aria-label="Inert state"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {STATE_OPTIONS.map((option) => {
              const active = isInert === option.value
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setIsInert(option.value)}
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


        <div
          ref={panelRef}
          className={cn(
            "flex flex-col gap-2.5 rounded-md border border-border-subtle bg-subtle/35 p-3 transition-opacity duration-150",
            isInert && "opacity-45"
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
              Target Subtree
            </span>
            <Badge
              variant={isInert ? "warning" : "accent"}
              size="compact"
            >
              {isInert ? 'inert · aria-hidden="true"' : "active"}
            </Badge>
          </div>

          <div className="flex items-center gap-1.5">
            <Input
              size="compact"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              aria-label="Subtree input"
              className="min-w-0 flex-1 font-mono"
            />
            <Button
              variant="secondary"
              size="compact"
              onClick={() => setClicks((c) => c + 1)}
              className="shrink-0 font-mono tabular-nums"
            >
              <PlusIcon />1 ({clicks})
            </Button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="justify-between border-t">
        <span className="font-mono text-2xs text-muted-foreground tabular-nums">
          clicks: <strong className="text-foreground">{clicks}</strong>
        </span>

        <Button
          variant={isInert ? "primary" : "secondary"}
          size="compact"
          onClick={() => setIsInert((prev) => !prev)}
        >
          {isInert ? (
            <>
              <UnlockIcon />
              Unlock Subtree
            </>
          ) : (
            <>
              <LockIcon />
              Lock Subtree
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
