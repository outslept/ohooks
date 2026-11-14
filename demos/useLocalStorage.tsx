"use client"

import { useEffect, useRef, useSyncExternalStore } from "react"
import { cn } from "cn"
import { Trash2 } from "lucide-react"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const STORAGE_KEY = "demo-local-username"

const PRESETS = [
  { id: "Ada Lovelace", label: "Ada" },
  { id: "Grace Hopper", label: "Grace" },
  { id: "Alan Turing", label: "Alan" },
] as const

function subscribeToLocalStorage(callback: () => void) {
  window.addEventListener("storage", callback)
  return () => window.removeEventListener("storage", callback)
}

function getRawBytesSnapshot(): number | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw !== null ? new Blob([raw]).size : null
  } catch {
    return null
  }
}

function getServerRawBytesSnapshot(): number | null {
  return null
}

function MirroredSubscriber() {
  const [mirrored] = useLocalStorage(STORAGE_KEY, "Ada Lovelace", {
    initializeWithValue: false,
  })

  return (
    <span className="truncate font-mono text-2xs text-foreground">
      mirror: &quot;{mirrored}&quot;
    </span>
  )
}

export default function UseLocalStorageDemo() {
  const [username, setUsername, removeUsername] = useLocalStorage(
    STORAGE_KEY,
    "Ada Lovelace",
    { initializeWithValue: false }
  )
  const rawBytes = useSyncExternalStore(
    subscribeToLocalStorage,
    getRawBytesSnapshot,
    getServerRawBytesSnapshot
  )
  const frameRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (
      typeof window !== "undefined" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      frameRef.current?.animate(
        [
          { transform: "scale3d(0.98, 0.98, 1)", opacity: 0.8 },
          { transform: "scale3d(1, 1, 1)", opacity: 1 },
        ],
        { duration: 180, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }
      )
    }
  }, [username])

  const handleRemove = () => {
    removeUsername()

    if (
      typeof window !== "undefined" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      frameRef.current?.animate(
        [
          { transform: "scale3d(0.97, 0.97, 1)", opacity: 0.75 },
          { transform: "scale3d(1, 1, 1)", opacity: 1 },
        ],
        { duration: 180, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }
      )
    }
  }

  const isPersisted = rawBytes !== null

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">

        <div className="flex items-center justify-between gap-2">

          <div
            role="group"
            aria-label="Preset storage values"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {PRESETS.map((preset) => {
              const isSelected = username === preset.id
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setUsername(preset.id)}
                  className={cn(
                    "rounded-[3px] px-1.5 py-0.5 font-mono text-2xs transition-all",
                    isSelected
                      ? "bg-control text-foreground shadow-control"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {preset.label}
                </button>
              )
            })}
          </div>
        </div>


        <div
          ref={frameRef}
          className="flex flex-col gap-2.5 rounded-md border border-border-subtle bg-subtle/35 p-3"
        >
          <div className="flex items-center justify-between gap-2">
            <Badge variant="code" size="compact">
              {STORAGE_KEY.slice(5)}
            </Badge>
            <Badge
              variant={isPersisted ? "accent" : "warning"}
              size="compact"
              className="tabular-nums"
            >
              {isPersisted ? `${rawBytes} B` : "null"}
            </Badge>
          </div>

          <Input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            aria-label="localStorage value"
            className="h-7 font-mono text-xs"
          />

          <div className="flex items-center justify-between gap-2 border-t border-border-subtle pt-2">
            <span className="font-mono text-2xs text-muted-foreground">
              subscriber
            </span>
            <MirroredSubscriber />
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t">
        <Button
          variant="secondary"
          size="compact"
          onClick={handleRemove}
          disabled={!isPersisted}
          leadingIcon={Trash2}
          className="w-full font-mono"
        >
          removeValue()
        </Button>
      </CardFooter>
    </Card>
  )
}
