"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "cn"
import { ShieldCheck } from "lucide-react"
import {
  usePermission,
  type ExtendedPermissionName,
} from "@/hooks/usePermission"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

const PERMISSIONS: readonly {
  id: ExtendedPermissionName
  label: string
}[] = [
  { id: "geolocation", label: "geo" },
  { id: "notifications", label: "notify" },
  { id: "camera", label: "camera" },
  { id: "microphone", label: "mic" },
]

export default function UsePermissionDemo() {
  const [selected, setSelected] =
    useState<ExtendedPermissionName>("geolocation")
  const [isRequesting, setIsRequesting] = useState(false)
  const status = usePermission(selected)
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
          { transform: "scale3d(0.97, 0.97, 1)", opacity: 0.75 },
          { transform: "scale3d(1, 1, 1)", opacity: 1 },
        ],
        { duration: 200, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }
      )
    }
  }, [selected, status])

  const requestPermission = async () => {
    if (typeof window === "undefined" || isRequesting) return
    setIsRequesting(true)

    try {
      if (selected === "geolocation" && "geolocation" in navigator) {
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => resolve(),
            () => resolve(),
            { timeout: 4000 }
          )
        })
      } else if (selected === "notifications" && "Notification" in window) {
        await Notification.requestPermission()
      } else if (
        (selected === "camera" || selected === "microphone") &&
        navigator.mediaDevices?.getUserMedia
      ) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: selected === "camera",
          audio: selected === "microphone",
        })
        stream.getTracks().forEach((track) => track.stop())
      }
    } catch {
    } finally {
      setIsRequesting(false)
    }
  }

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">

        <div className="flex items-center justify-between gap-2">

          <div
            role="group"
            aria-label="Permission descriptor"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {PERMISSIONS.map((item) => {
              const isSelected = selected === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelected(item.id)}
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
          className="flex flex-col items-center justify-center gap-2 rounded-md border border-border-subtle bg-subtle/35 px-4 py-4"
        >
          <span className="font-mono text-base font-semibold tracking-tight text-foreground">
            {selected}
          </span>
        </div>
      </CardContent>

      <CardFooter className="border-t">
        <Button
          variant="primary"
          size="compact"
          onClick={requestPermission}
          loading={isRequesting}
          disabled={isRequesting || status === "unsupported"}
          leadingIcon={ShieldCheck}
          className="w-full"
        >
          {isRequesting ? "Requesting…" : "Request access"}
        </Button>
      </CardFooter>
    </Card>
  )
}
