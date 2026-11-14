"use client"

import { useState } from "react"
import { PowerIcon, PowerOffIcon } from "lucide-react"
import { cn } from "cn"

import { useElementRef } from "@/hooks/useElementRef"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

type TagOption = "div" | "section" | "article"

const TAGS: TagOption[] = ["div", "section", "article"]

export default function UseElementRefDemo() {
  const [mounted, setMounted] = useState(true)
  const [tag, setTag] = useState<TagOption>("div")
  const [ref, element] = useElementRef<HTMLElement>()

  const Tag = tag

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">

        <div className="flex items-center justify-between gap-2">

          <div
            role="group"
            aria-label="HTML tag"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {TAGS.map((option) => {
              const active = tag === option
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setTag(option)
                    if (!mounted) setMounted(true)
                  }}
                  className={cn(
                    "rounded-[3px] px-1.5 py-0.5 font-mono text-3xs font-medium transition-all",
                    active
                      ? "bg-control text-foreground shadow-control"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {`<${option}>`}
                </button>
              )
            })}
          </div>
        </div>


        {mounted ? (
          <Tag
            key={tag}
            ref={ref}
            className="flex flex-col gap-2 rounded-md border border-border-subtle bg-subtle/35 px-3.5 py-3 transition-all"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-sm font-semibold text-foreground">
                {element ? `<${element.tagName.toLowerCase()}>` : "mounting..."}
              </span>
              <Badge variant="accent" size="compact">
                HTML{tag.charAt(0).toUpperCase() + tag.slice(1)}Element
              </Badge>
            </div>
            <span className="font-mono text-2xs text-muted-foreground">
              Reactive callback ref synced on mount & tag swap.
            </span>
          </Tag>
        ) : (
          <div className="flex flex-col gap-2 rounded-md border border-dashed border-border bg-subtle/15 px-3.5 py-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-sm font-semibold text-muted-foreground">
                {element === null ? "null" : `<${element.tagName.toLowerCase()}>`}
              </span>
              <Badge variant="secondary" size="compact">
                Unmounted
              </Badge>
            </div>
            <span className="font-mono text-2xs text-muted-foreground">
              Node detached from DOM tree; ref state is null.
            </span>
          </div>
        )}
      </CardContent>


      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            Dimensions
          </span>
          <span className="font-mono text-xs font-medium text-foreground tabular-nums">
            {element
              ? `${element.clientWidth}×${element.clientHeight}px`
              : "0×0px"}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            isConnected
          </span>
          <span className="font-mono text-xs font-medium text-foreground tabular-nums">
            {String(Boolean(element?.isConnected))}
          </span>
        </div>
      </div>

      <CardFooter className="border-t">
        <Button
          variant={mounted ? "secondary" : "primary"}
          size="compact"
          onClick={() => setMounted((prev) => !prev)}
          className="w-full"
        >
          {mounted ? (
            <>
              <PowerOffIcon />
              Unmount Element
            </>
          ) : (
            <>
              <PowerIcon />
              Mount Element
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
