"use client"

import { useEffect, useRef, useState } from "react"
import { Plus, RefreshCw, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useUpdateEffect } from "@/hooks/useUpdateEffect"

function UpdateEffectStage({ onRemount }: { onRemount: () => void }) {
  const [state, setState] = useState({ dep: 0, renders: 1 })
  const runsRef = useRef(0)
  const runsNodeRef = useRef<HTMLSpanElement>(null)
  const statusNodeRef = useRef<HTMLSpanElement>(null)

  useUpdateEffect(() => {
    runsRef.current += 1

    if (runsNodeRef.current) {
      runsNodeRef.current.textContent = String(runsRef.current)
    }
    if (statusNodeRef.current) {
      statusNodeRef.current.textContent =
        runsRef.current === 1 ? "run · effect fired" : "runs · effect fired"
    }
  }, [state.dep])

  useEffect(() => {
    if (runsNodeRef.current) {
      runsNodeRef.current.textContent = String(runsRef.current)
    }
    if (statusNodeRef.current) {
      statusNodeRef.current.textContent =
        runsRef.current === 0
          ? "runs · mount skipped"
          : runsRef.current === 1
            ? "run · effect fired"
            : "runs · effect fired"
    }
  })

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex flex-col items-center justify-center gap-1 rounded-md border border-border-subtle bg-subtle/35 py-5 font-mono tabular-nums">
          <div className="flex items-baseline gap-1.5">
            <span
              ref={runsNodeRef}
              className="text-2xl font-bold tracking-tight text-primary"
            >
              0
            </span>
            <span
              ref={statusNodeRef}
              className="text-xs text-muted-foreground"
            >
              runs · mount skipped
            </span>
          </div>
        </div>
      </CardContent>

      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col gap-0.5 px-4 py-2.5">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            Dependency
          </span>
          <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
            dep = {state.dep}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 px-4 py-2.5">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            Total Renders
          </span>
          <span className="font-mono text-xs font-semibold text-primary tabular-nums">
            {state.renders}
          </span>
        </div>
      </div>

      <CardFooter className="border-t">
        <Button
          variant="primary"
          size="compact"
          leadingIcon={<Plus />}
          onClick={() =>
            setState((s) => ({ dep: s.dep + 1, renders: s.renders + 1 }))
          }
          className="flex-1"
        >
          Update dep
        </Button>
        <Button
          variant="secondary"
          size="compact"
          leadingIcon={<RefreshCw />}
          onClick={() => setState((s) => ({ ...s, renders: s.renders + 1 }))}
        >
          Re-render
        </Button>
        <Button
          variant="tertiary"
          size="icon-compact"
          onClick={onRemount}
          aria-label="Remount component"
        >
          <RotateCcw />
        </Button>
      </CardFooter>
    </Card>
  )
}

export default function UseUpdateEffectDemo() {
  const [mountKey, setMountKey] = useState(0)

  return (
    <UpdateEffectStage
      key={mountKey}
      onRemount={() => setMountKey((k) => k + 1)}
    />
  )
}
