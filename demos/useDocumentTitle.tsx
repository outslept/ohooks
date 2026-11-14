"use client"

import { useState, useSyncExternalStore } from "react"
import { MinusIcon, PlusIcon, RotateCcwIcon } from "lucide-react"
import { cn } from "cn"

import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

function TitleUpdater({ title }: { title: string }) {
  useDocumentTitle(title, { restoreOnUnmount: true })
  return null
}

const MOUNT_MODES = [
  { value: true, label: "Mounted" },
  { value: false, label: "Unmounted" },
] as const

function subscribeToDocumentTitle(callback: () => void) {
  if (typeof document === "undefined") return () => {}
  const target = document.querySelector("title") ?? document.head
  if (!target) return () => {}
  const observer = new MutationObserver(callback)
  observer.observe(target, {
    subtree: true,
    childList: true,
    characterData: true,
  })
  return () => observer.disconnect()
}

function getDocumentTitleSnapshot(): string {
  return typeof document !== "undefined" ? document.title : ""
}

function getServerDocumentTitleSnapshot(): string {
  return ""
}

export default function UseDocumentTitleDemo() {
  const [unread, setUnread] = useState(3)
  const [isMounted, setIsMounted] = useState(true)

  const targetTitle =
    unread > 0 ? `(${unread}) Inbox — Hooks` : "Inbox — Hooks"

  const docTitle = useSyncExternalStore(
    subscribeToDocumentTitle,
    getDocumentTitleSnapshot,
    getServerDocumentTitleSnapshot
  )

  return (
    <Card className="w-full max-w-80">
      {isMounted && <TitleUpdater title={targetTitle} />}

      <CardContent className="flex flex-col gap-3 pt-4 pb-4">

        <div className="flex items-center justify-between gap-2">

          <div
            role="group"
            aria-label="Hook mount state"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {MOUNT_MODES.map((mode) => {
              const active = isMounted === mode.value
              return (
                <button
                  key={String(mode.value)}
                  type="button"
                  onClick={() => setIsMounted(mode.value)}
                  className={cn(
                    "rounded-[3px] px-1.5 py-0.5 font-mono text-3xs font-medium transition-all",
                    active
                      ? "bg-control text-foreground shadow-control"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {mode.label}
                </button>
              )
            })}
          </div>
        </div>


        <div className="flex flex-col gap-2 rounded-md border border-border-subtle bg-subtle/35 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
              Active Tab Title
            </span>
            <Badge
              variant={isMounted ? "accent" : "secondary"}
              size="compact"
              className="tabular-nums"
            >
              {isMounted ? `unread: ${unread}` : "restored"}
            </Badge>
          </div>

          <p className="truncate font-mono text-xs font-semibold text-foreground tabular-nums">
            {docTitle || targetTitle}
          </p>
        </div>
      </CardContent>


      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            Restore On Unmount
          </span>
          <span className="font-mono text-xs font-medium text-foreground">
            true
          </span>
        </div>
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            Hook Status
          </span>
          <span className="font-mono text-xs font-medium text-foreground">
            {isMounted ? "Syncing" : "Detached"}
          </span>
        </div>
      </div>

      <CardFooter className="border-t">
        <Button
          variant="secondary"
          size="compact"
          onClick={() => setUnread((n) => Math.max(0, n - 1))}
          disabled={!isMounted || unread === 0}
          className="flex-1 font-mono tabular-nums"
        >
          <MinusIcon />1
        </Button>
        <Button
          variant="primary"
          size="compact"
          onClick={() => setUnread((n) => n + 1)}
          disabled={!isMounted}
          className="flex-1 font-mono tabular-nums"
        >
          <PlusIcon />1
        </Button>
        <Button
          variant="tertiary"
          size="compact"
          onClick={() => setUnread(0)}
          disabled={!isMounted || unread === 0}
        >
          <RotateCcwIcon />
          Clear
        </Button>
      </CardFooter>
    </Card>
  )
}
