"use client"

import { useRef, useState } from "react"
import { CrosshairIcon, EyeOffIcon } from "lucide-react"
import { cn } from "cn"

import { useFocus } from "@/hooks/useFocus"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const FOCUS_OPTIONS = [
  { label: "all focus", focusVisible: false },
  { label: ":focus-visible", focusVisible: true },
] as const

export default function UseFocusDemo() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [focusVisible, setFocusVisible] = useState<boolean>(false)
  const [focusCount, setFocusCount] = useState<number>(0)

  const { isFocused, focus, blur } = useFocus(inputRef, {
    focusVisible,
    onFocus: () => setFocusCount((c) => c + 1),
  })

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">

        <div className="flex items-center justify-between gap-2">

          <div
            role="group"
            aria-label="Focus visible option"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {FOCUS_OPTIONS.map((option) => {
              const active = focusVisible === option.focusVisible
              return (
                <button
                  key={option.label}
                  type="button"
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={() => setFocusVisible(option.focusVisible)}
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
          className={cn(
            "flex flex-col gap-2 rounded-md border p-3 transition-colors",
            isFocused
              ? "border-primary/35 bg-primary/5"
              : "border-border-subtle bg-subtle/35"
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
              Target Input
            </span>
            <Badge
              variant={isFocused ? "accent" : "secondary"}
              size="compact"
            >
              isFocused: {String(isFocused)}
            </Badge>
          </div>

          <Input
            ref={inputRef}
            size="compact"
            type="text"
            defaultValue="Focusable input target"
            aria-label="Focus target input"
            className="font-mono"
          />
        </div>
      </CardContent>


      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            Focus Events
          </span>
          <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
            {focusCount}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            Match Mode
          </span>
          <span className="font-mono text-xs font-medium text-foreground">
            {focusVisible ? "focus-visible" : " standard"}
          </span>
        </div>
      </div>

      <CardFooter className="border-t">
        <Button
          variant="primary"
          size="compact"
          onPointerDown={(e) => e.preventDefault()}
          onClick={() => focus()}
          disabled={isFocused}
          className="flex-1 font-mono"
        >
          <CrosshairIcon />
          focus()
        </Button>
        <Button
          variant="secondary"
          size="compact"
          onPointerDown={(e) => e.preventDefault()}
          onClick={() => blur()}
          disabled={!isFocused}
          className="flex-1 font-mono"
        >
          <EyeOffIcon />
          blur()
        </Button>
      </CardFooter>
    </Card>
  )
}
