"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "cn"
import { Sparkles, Trash2 } from "lucide-react"
import { useObjectUrl } from "@/hooks/useObjectUrl"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

const PATTERNS = [
  { id: "grid", label: "grid", hue: 195 },
  { id: "rings", label: "rings", hue: 262 },
  { id: "wave", label: "wave", hue: 152 },
] as const

type PatternId = (typeof PATTERNS)[number]["id"]

function createSvgMarkup(pattern: PatternId, seed: number): string {
  const baseHue =
    (PATTERNS.find((item) => item.id === pattern)?.hue ?? 200) +
    ((seed * 23) % 45)

  const shape =
    pattern === "grid"
      ? `<path d="M0 18 H220 M0 36 H220 M44 0 V54 M88 0 V54 M132 0 V54 M176 0 V54" stroke="hsla(${baseHue},85%,75%,0.28)" stroke-width="1"/>`
      : pattern === "rings"
        ? `<circle cx="110" cy="27" r="12" fill="none" stroke="hsla(${baseHue},90%,78%,0.45)" stroke-width="1.5"/><circle cx="110" cy="27" r="24" fill="none" stroke="hsla(${baseHue},90%,78%,0.28)" stroke-width="1.5"/><circle cx="110" cy="27" r="38" fill="none" stroke="hsla(${baseHue},90%,78%,0.16)" stroke-width="1.5"/>`
        : `<path d="M0 32 Q 27.5 10, 55 32 T 110 32 T 165 32 T 220 32" fill="none" stroke="hsla(${baseHue},90%,76%,0.5)" stroke-width="2"/>`

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 54" width="220" height="54"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="hsl(${baseHue} 75% 22%)"/><stop offset="100%" stop-color="hsl(${(baseHue + 35) % 360} 80% 14%)"/></linearGradient></defs><rect width="220" height="54" fill="url(#g)"/>${shape}</svg>`
}

export default function UseObjectUrlDemo() {
  const [pattern, setPattern] = useState<PatternId>("grid")
  const [seed, setSeed] = useState(1)
  const [blob, setBlob] = useState<Blob | null>(() => {
    const svg = createSvgMarkup("grid", 1)
    return new Blob([svg], { type: "image/svg+xml" })
  })

  const objectUrl = useObjectUrl(blob)
  const frameRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)

  const mintBlob = useCallback((nextPattern: PatternId, nextSeed: number) => {
    const svg = createSvgMarkup(nextPattern, nextSeed)
    setBlob(new Blob([svg], { type: "image/svg+xml" }))
  }, [])

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
          { transform: "scale3d(0.97, 0.97, 1)", opacity: 0.75 },
          { transform: "scale3d(1, 1, 1)", opacity: 1 },
        ],
        { duration: 200, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }
      )
    }
  }, [objectUrl])

  const handleGenerate = () => {
    const nextSeed = seed + 1
    setSeed(nextSeed)
    mintBlob(pattern, nextSeed)
  }

  const handleSelectPattern = (nextPattern: PatternId) => {
    const nextSeed = seed + 1
    setPattern(nextPattern)
    setSeed(nextSeed)
    mintBlob(nextPattern, nextSeed)
  }

  const shortToken = objectUrl
    ? `blob:…/${objectUrl.split("/").pop()?.slice(-8) ?? ""}`
    : "null (revoked)"

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">

        <div className="flex items-center justify-between gap-2">

          <div
            role="group"
            aria-label="Blob SVG preset"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {PATTERNS.map((item) => {
              const isSelected = pattern === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectPattern(item.id)}
                  className={cn(
                    "rounded-[3px] px-1.5 py-0.5 font-mono text-2xs transition-all",
                    isSelected
                      ? "bg-control text-foreground shadow-control"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>


        <div
          ref={frameRef}
          className="flex flex-col gap-2.5 rounded-md border border-border-subtle bg-subtle/35 p-2.5"
        >
          <div
            className="flex h-16 w-full items-center justify-center overflow-hidden rounded-sm border border-border-subtle bg-subtle bg-cover bg-center font-mono text-2xs text-muted-foreground"
            style={{
              backgroundImage: objectUrl ? `url("${objectUrl}")` : undefined,
            }}
          >
            {!objectUrl && <span>No active Blob</span>}
          </div>

          <div className="flex items-center justify-between gap-2">
            <Badge
              variant={objectUrl ? "code" : "secondary"}
              size="compact"
              className="truncate"
            >
              {shortToken}
            </Badge>
            <Badge variant="accent" size="compact" className="tabular-nums">
              {blob ? `${blob.size} B` : "0 B"}
            </Badge>
          </div>
        </div>
      </CardContent>

      <CardFooter className="gap-2 border-t">
        <Button
          variant="primary"
          size="compact"
          onClick={handleGenerate}
          leadingIcon={Sparkles}
          className="flex-1"
        >
          Mint Blob
        </Button>
        <Button
          variant="secondary"
          size="compact"
          onClick={() => setBlob(null)}
          disabled={!blob}
          leadingIcon={Trash2}
        >
          Revoke
        </Button>
      </CardFooter>
    </Card>
  )
}
