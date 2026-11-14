"use client"

import { useRef, useState } from "react"
import { cn } from "cn"
import { ArrowDown, RotateCcw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useScrollSpy } from "@/hooks/useScrollSpy"

const SECTIONS = [
  {
    id: "spy-intro",
    label: "Intro",
    metric: "01 · Overview",
    detail: "IntersectionObserver tracks section entry in real time.",
  },
  {
    id: "spy-config",
    label: "Config",
    metric: "02 · Root Margin",
    detail: "Ranks intersecting targets relative to the scroll root.",
  },
  {
    id: "spy-perf",
    label: "Perf",
    metric: "03 · Zero Polling",
    detail: "Passive observer callbacks without scroll listener thrashing.",
  },
  {
    id: "spy-api",
    label: "API",
    metric: "04 · Return Value",
    detail: "Returns the active section ID or null when out of view.",
  },
] as const

const TARGET_SELECTORS = SECTIONS.map((s) => `#${s.id}`)

const ZONES = [
  { key: "top", label: "Top", rootMargin: "0px 0px -60% 0px" },
  { key: "mid", label: "Center", rootMargin: "-30% 0px -30% 0px" },
] as const

type ZoneKey = (typeof ZONES)[number]["key"]

export default function UseScrollSpyDemo() {
  const scrollRootRef = useRef<HTMLDivElement>(null)
  const [zoneKey, setZoneKey] = useState<ZoneKey>("top")

  const activeZone = ZONES.find((z) => z.key === zoneKey) ?? ZONES[0]

  const activeId = useScrollSpy(TARGET_SELECTORS, {
    root: scrollRootRef,
    rootMargin: activeZone.rootMargin,
    threshold: 0.1,
  })

  const scrollToSection = (id: string) => {
    const container = scrollRootRef.current
    const target = container?.querySelector<HTMLElement>(`#${id}`)
    if (!container || !target) return

    container.scrollTo({
      top: target.offsetTop - container.offsetTop - 6,
      behavior: "smooth",
    })
  }

  const handleNextSection = () => {
    const currentIndex = SECTIONS.findIndex((s) => s.id === activeId)
    const nextIndex = (currentIndex + 1) % SECTIONS.length
    scrollToSection(SECTIONS[nextIndex].id)
  }

  const handleResetScroll = () => {
    scrollRootRef.current?.scrollTo({ top: 0, behavior: "smooth" })
  }

  const activeIndex = SECTIONS.findIndex((s) => s.id === activeId)

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between">

          <div
            role="group"
            aria-label="Observer trigger zone"
            className="inline-flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {ZONES.map((zone) => {
              const active = zoneKey === zone.key
              return (
                <button
                  key={zone.key}
                  type="button"
                  onClick={() => setZoneKey(zone.key)}
                  className={cn(
                    "rounded-[3px] px-2 py-0.5 font-mono text-2xs font-medium transition-all",
                    active
                      ? "bg-control text-foreground shadow-control"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {zone.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1 rounded-sm border border-border-subtle bg-subtle/40 p-1">
          {SECTIONS.map((section) => {
            const isActive = activeId === section.id
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  "rounded-[3px] py-1 font-mono text-2xs font-medium transition-all",
                  isActive
                    ? "bg-primary/15 text-primary ring-1 ring-inset ring-primary/30"
                    : "text-muted-foreground hover:bg-control/60 hover:text-foreground"
                )}
              >
                {section.label}
              </button>
            )
          })}
        </div>

        <div
          ref={scrollRootRef}
          className="relative flex h-32 flex-col gap-2 overflow-y-auto rounded-md border border-border-subtle bg-subtle/35 p-2 scroll-smooth"
        >
          {SECTIONS.map((section) => {
            const isActive = activeId === section.id
            return (
              <section
                key={section.id}
                id={section.id}
                className={cn(
                  "flex min-h-22 shrink-0 flex-col justify-between rounded-sm border p-2.5 transition-colors",
                  isActive
                    ? "border-primary/40 bg-card shadow-control"
                    : "border-border-subtle bg-card/50 opacity-75"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xs font-semibold text-foreground">
                    {section.metric}
                  </span>
                  <Badge
                    variant={isActive ? "accent" : "code"}
                    size="compact"
                  >
                    #{section.id}
                  </Badge>
                </div>
                <p className="text-2xs leading-relaxed text-muted-foreground">
                  {section.detail}
                </p>
              </section>
            )
          })}
        </div>
      </CardContent>

      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col gap-0.5 px-4 py-2.5">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            Active ID
          </span>
          <span className="truncate font-mono text-xs font-semibold text-primary">
            {activeId ? `#${activeId}` : "null"}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 px-4 py-2.5">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            Section Index
          </span>
          <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
            {activeIndex >= 0 ? `${activeIndex + 1} / ${SECTIONS.length}` : "—"}
          </span>
        </div>
      </div>

      <CardFooter className="border-t">
        <Button
          variant="primary"
          size="compact"
          leadingIcon={ArrowDown}
          onClick={handleNextSection}
          className="flex-1"
        >
          Next Section
        </Button>
        <Button
          variant="tertiary"
          size="icon-compact"
          onClick={handleResetScroll}
          aria-label="Scroll back to top"
        >
          <RotateCcw />
        </Button>
      </CardFooter>
    </Card>
  )
}
