"use client"

import { useRef, useState } from "react"
import { LockIcon, UnlockIcon } from "lucide-react"
import { cn } from "cn"

import { useFocusTrap } from "@/hooks/useFocusTrap"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const INITIAL_OPTIONS = [
  { label: "init #1", selector: '[data-focus="1"]' },
  { label: "init #2", selector: '[data-focus="2"]' },
] as const

export default function UseFocusTrapDemo() {
  const [trapped, setTrapped] = useState(false)
  const [initIdx, setInitIdx] = useState(0)
  const [focusedSlot, setFocusedSlot] = useState<string>("none")
  const trapRef = useRef<HTMLDivElement>(null)

  useFocusTrap(trapRef, {
    enabled: trapped,
    initialFocus: INITIAL_OPTIONS[initIdx].selector,
    restoreFocus: true,
    onEscape: () => setTrapped(false),
  })

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">

        <div className="flex items-center justify-between gap-2">

          <div
            role="group"
            aria-label="Initial focus selector"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {INITIAL_OPTIONS.map((option, idx) => {
              const active = initIdx === idx
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setInitIdx(idx)}
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


        <div
          ref={trapRef}
          onFocusCapture={(e) => {
            const slot = (e.target as HTMLElement).getAttribute("data-focus")
            if (slot) setFocusedSlot(`#${slot}`)
          }}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
              setFocusedSlot("none")
            }
          }}
          className={cn(
            "flex flex-col gap-2 rounded-md border p-3 transition-colors",
            trapped
              ? "border-primary/40 bg-primary/5"
              : "border-border-subtle bg-subtle/35"
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
              Tab Cycle Scope
            </span>
            <Badge
              variant={trapped ? "accent" : "secondary"}
              size="compact"
              className="tabular-nums"
            >
              focus: {focusedSlot}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Input
              size="compact"
              type="text"
              data-focus="1"
              defaultValue="Field #1"
              aria-label="First trapped input"
              className="font-mono"
            />
            <Input
              size="compact"
              type="text"
              data-focus="2"
              defaultValue="Field #2"
              aria-label="Second trapped input"
              className="font-mono"
            />
          </div>

          <Button
            variant="tertiary"
            size="compact"
            data-focus="3"
            onClick={() => setTrapped(false)}
            disabled={!trapped}
            className="w-full font-mono"
          >
            Slot #3 — Esc / Exit Trap
          </Button>
        </div>
      </CardContent>

      <CardFooter className="border-t">
        <Button
          variant={trapped ? "secondary" : "primary"}
          size="compact"
          onClick={() => setTrapped((prev) => !prev)}
          className="w-full"
        >
          {trapped ? (
            <>
              <UnlockIcon />
              Release Trap
            </>
          ) : (
            <>
              <LockIcon />
              Trap Focus
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
