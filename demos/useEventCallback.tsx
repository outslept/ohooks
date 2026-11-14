"use client"

import { memo, useEffect, useRef, useState } from "react"
import { PlayIcon, RefreshCwIcon } from "lucide-react"
import { cn } from "cn"

import { useEventCallback } from "@/hooks/useEventCallback"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const MODE_OPTIONS = [
  { label: "stable", stable: true },
  { label: "inline", stable: false },
] as const

const MemoizedChild = memo(function MemoizedChild({
  onAction,
}: {
  onAction: () => void
}) {
  const rendersRef = useRef(1)
  const lastActionRef = useRef(onAction)
  const countNodeRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (lastActionRef.current !== onAction) {
      lastActionRef.current = onAction
      rendersRef.current += 1
      if (countNodeRef.current) {
        countNodeRef.current.textContent = String(rendersRef.current)
      }
    }
  }, [onAction])

  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-border-subtle bg-subtle/35 px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="font-mono text-2xs text-muted-foreground">
          memo child renders:
        </span>
        <Badge variant="code" size="compact" className="tabular-nums">
          <span ref={countNodeRef}>1</span>
        </Badge>
      </div>
      <Button
        variant="secondary"
        size="compact"
        onClick={onAction}
        className="font-mono"
      >
        fn()
      </Button>
    </div>
  )
})

export default function UseEventCallbackDemo() {
  const [text, setText] = useState("Payload v1")
  const [parentEdits, setParentEdits] = useState(1)
  const [useStable, setUseStable] = useState(true)
  const [lastLogged, setLastLogged] = useState<string>("Payload v1")
  const [invocations, setInvocations] = useState(0)

  const stableAction = useEventCallback(() => {
    setLastLogged(text)
    setInvocations((c) => c + 1)
  })

  const inlineAction = () => {
    setLastLogged(text)
    setInvocations((c) => c + 1)
  }

  const activeCallback = useStable ? stableAction : inlineAction

  const updateText = (next: string) => {
    setText(next)
    setParentEdits((c) => c + 1)
  }

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between gap-2">
          <div
            role="group"
            aria-label="Callback reference stability mode"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {MODE_OPTIONS.map((option) => {
              const active = useStable === option.stable
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setUseStable(option.stable)}
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

        <Input
          size="compact"
          type="text"
          value={text}
          onChange={(e) => updateText(e.target.value)}
          placeholder="Type to update parent state..."
          aria-label="Parent state text"
          className="font-mono"
        />

        <MemoizedChild onAction={activeCallback} />
      </CardContent>

      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            Parent Renders
          </span>
          <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
            {parentEdits}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            Read (#{invocations})
          </span>
          <span className="truncate font-mono text-xs font-semibold text-primary">
            &quot;{lastLogged}&quot;
          </span>
        </div>
      </div>

      <CardFooter className="border-t">
        <Button
          variant="primary"
          size="compact"
          onClick={() => updateText(`Payload v${parentEdits + 1}`)}
          className="flex-1"
        >
          <RefreshCwIcon />
          Mutate Parent
        </Button>
        <Button
          variant="secondary"
          size="compact"
          onClick={activeCallback}
          className="flex-1"
        >
          <PlayIcon />
          Read Latest
        </Button>
      </CardFooter>
    </Card>
  )
}
