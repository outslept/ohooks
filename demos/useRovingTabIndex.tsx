"use client"

import { useState } from "react"
import { cn } from "cn"
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Ban,
  Crosshair,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useRovingTabIndex } from "@/hooks/useRovingTabIndex"

const TOOLS = [
  { id: "left", label: "Left", icon: AlignLeft },
  { id: "center", label: "Center", icon: AlignCenter },
  { id: "right", label: "Right", icon: AlignRight },
  { id: "justify", label: "Justify", icon: AlignJustify },
] as const

const LOOP_MODES = ["loop", "clamp"] as const
type LoopMode = (typeof LOOP_MODES)[number]

export default function UseRovingTabIndexDemo() {
  const [loopMode, setLoopMode] = useState<LoopMode>("loop")
  const [disableThird, setDisableThird] = useState(false)
  const [_hasFocusWithin, setHasFocusWithin] = useState(false)
  const [lastKey, setLastKey] = useState<string>("none")

  const loop = loopMode === "loop"

  const { activeIndex, focusItem, getItemProps } = useRovingTabIndex({
    orientation: "horizontal",
    loop,
  })

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between">

          <div
            role="group"
            aria-label="Roving boundary behavior"
            className="inline-flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {LOOP_MODES.map((m) => {
              const active = loopMode === m
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setLoopMode(m)}
                  className={cn(
                    "rounded-[3px] px-2 py-0.5 font-mono text-2xs font-medium capitalize transition-all",
                    active
                      ? "bg-control text-foreground shadow-control"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {m}
                </button>
              )
            })}
          </div>
        </div>

        <div
          onFocusCapture={() => setHasFocusWithin(true)}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
              setHasFocusWithin(false)
            }
          }}
          className="flex flex-col gap-2 rounded-md border border-border-subtle bg-subtle/35 p-2.5"
        >
          <div
            role="toolbar"
            aria-label="Text alignment"
            className="grid grid-cols-4 gap-1.5"
          >
            {TOOLS.map((tool, index) => {
              const Icon = tool.icon
              const isItemDisabled = index === 2 && disableThird
              const isActive = activeIndex === index && !isItemDisabled
              const itemProps = getItemProps<HTMLButtonElement>(index, {
                disabled: isItemDisabled,
                onKeyDown: (e) => {
                  if (
                    e.key === "ArrowLeft" ||
                    e.key === "ArrowRight" ||
                    e.key === "Home" ||
                    e.key === "End"
                  ) {
                    setLastKey(e.key)
                  }
                },
              })

              return (
                <button
                  key={tool.id}
                  type="button"
                  {...itemProps}
                  disabled={isItemDisabled}
                  aria-label={tool.label}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 rounded-sm border py-2 font-mono transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-35",
                    isActive
                      ? "border-primary/40 bg-primary/10 text-primary shadow-control"
                      : "border-border-subtle bg-card/80 text-muted-foreground hover:bg-control hover:text-foreground"
                  )}
                >
                  <Icon className="size-3.5" />
                  <span className="text-2xs font-medium">{tool.label}</span>
                  <span className="text-3xs tabular-nums opacity-75">
                    tab={itemProps.tabIndex}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-between font-mono text-3xs text-muted-foreground">
            <span>{disableThird ? "item #3 skipped" : "all 4 enabled"}</span>
            <span>single tab stop</span>
          </div>
        </div>
      </CardContent>

      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col gap-0.5 px-4 py-2.5">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            Active Index
          </span>
          <span className="font-mono text-xs font-semibold tabular-nums text-primary">
            #{activeIndex} ({TOOLS[activeIndex]?.label})
          </span>
        </div>
        <div className="flex flex-col gap-0.5 px-4 py-2.5">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            Last Key
          </span>
          <span className="font-mono text-xs font-semibold text-foreground">
            {lastKey}
          </span>
        </div>
      </div>

      <CardFooter className="border-t">
        <Button
          variant="primary"
          size="compact"
          leadingIcon={Crosshair}
          onClick={() => focusItem(activeIndex)}
          className="flex-1"
        >
          Focus Toolbar
        </Button>
        <Button
          variant="secondary"
          size="compact"
          active={disableThird}
          leadingIcon={Ban}
          onClick={() => setDisableThird((prev) => !prev)}
        >
          {disableThird ? "Enable #3" : "Disable #3"}
        </Button>
      </CardFooter>
    </Card>
  )
}
