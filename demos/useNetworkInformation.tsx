"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "cn"
import { DatabaseZap } from "lucide-react"
import {
  useNetworkInformation,
  type EffectiveConnectionType,
} from "@/hooks/useNetworkInformation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface ProfilePreset {
  id: "system" | EffectiveConnectionType
  label: string
  effectiveType?: EffectiveConnectionType
  downlink?: number
  rtt?: number
}

const PROFILES: readonly ProfilePreset[] = [
  { id: "system", label: "System" },
  { id: "4g", label: "4g", effectiveType: "4g", downlink: 10, rtt: 50 },
  { id: "3g", label: "3g", effectiveType: "3g", downlink: 1.6, rtt: 300 },
  {
    id: "slow-2g",
    label: "2g",
    effectiveType: "slow-2g",
    downlink: 0.4,
    rtt: 1200,
  },
]

type ProfileId = (typeof PROFILES)[number]["id"]

function syncNavigatorConnection(
  profileId: ProfileId,
  saveDataOverride: boolean | null
) {
  if (typeof window === "undefined") return

  delete (window.navigator as { connection?: unknown }).connection
  const nativeConn = (
    window.navigator as Navigator & {
      connection?: {
        downlink?: number
        downlinkMax?: number
        effectiveType?: EffectiveConnectionType
        rtt?: number
        saveData?: boolean
        type?: string
      }
    }
  ).connection

  if (profileId === "system" && saveDataOverride === null) {
    window.dispatchEvent(
      new Event(window.navigator.onLine ? "online" : "offline")
    )
    return
  }

  const preset = PROFILES.find((item) => item.id === profileId)
  const mockTarget = new EventTarget()

  Object.assign(mockTarget, {
    effectiveType:
      profileId === "system"
        ? (nativeConn?.effectiveType ?? "4g")
        : preset?.effectiveType,
    downlink:
      profileId === "system"
        ? (nativeConn?.downlink ?? 10)
        : preset?.downlink,
    downlinkMax: nativeConn?.downlinkMax,
    rtt: profileId === "system" ? (nativeConn?.rtt ?? 50) : preset?.rtt,
    saveData:
      saveDataOverride !== null
        ? saveDataOverride
        : Boolean(nativeConn?.saveData),
    type: nativeConn?.type ?? "wifi",
  })

  Object.defineProperty(window.navigator, "connection", {
    value: mockTarget,
    configurable: true,
  })

  window.dispatchEvent(
    new Event(window.navigator.onLine ? "online" : "offline")
  )
}

export default function UseNetworkInformationDemo() {
  const { isOnline, isSupported, effectiveType, downlink, rtt, saveData } =
    useNetworkInformation()
  const [profile, setProfile] = useState<ProfileId>("system")
  const [saveDataOverride, setSaveDataOverride] = useState<boolean | null>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        delete (window.navigator as { connection?: unknown }).connection
        window.dispatchEvent(
          new Event(window.navigator.onLine ? "online" : "offline")
        )
      }
    }
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
  }, [effectiveType, downlink, rtt, saveData, isOnline])

  const handleSelectProfile = (nextProfile: ProfileId) => {
    const nextSaveData = nextProfile === "system" ? null : saveDataOverride
    setProfile(nextProfile)
    setSaveDataOverride(nextSaveData)
    syncNavigatorConnection(nextProfile, nextSaveData)
  }

  const handleToggleSaveData = () => {
    const nextSaveData = !saveData
    const nextProfile = profile === "system" && !isSupported ? "4g" : profile
    setProfile(nextProfile)
    setSaveDataOverride(nextSaveData)
    syncNavigatorConnection(nextProfile, nextSaveData)
  }

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">

        <div className="flex items-center justify-between gap-2">

          <div
            role="group"
            aria-label="Network profile"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {PROFILES.map((item) => {
              const isSelected = profile === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectProfile(item.id)}
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
          className="flex flex-col items-center justify-center gap-1.5 rounded-md border border-border-subtle bg-subtle/35 px-4 py-4"
        >
          <span className="font-mono text-2xl font-semibold tracking-tight text-foreground uppercase tabular-nums">
            {effectiveType ?? "N/A"}
          </span>
          <Badge
            variant={isOnline ? "accent" : "destructive"}
            size="compact"
            className="tabular-nums"
          >
            {downlink !== undefined ? `${downlink} Mbps` : "— Mbps"}
          </Badge>
        </div>
      </CardContent>


      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="text-2xs font-medium tracking-wider text-muted-foreground uppercase">
            Latency (RTT)
          </span>
          <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
            {rtt !== undefined ? `${rtt}ms` : "—"}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="text-2xs font-medium tracking-wider text-muted-foreground uppercase">
            Save-Data
          </span>
          <span
            className={cn(
              "font-mono text-xs font-semibold",
              saveData ? "text-primary" : "text-foreground"
            )}
          >
            {saveData !== undefined ? String(saveData) : "—"}
          </span>
        </div>
      </div>

      <CardFooter className="border-t">
        <Button
          variant={saveData ? "primary" : "secondary"}
          size="compact"
          onClick={handleToggleSaveData}
          leadingIcon={DatabaseZap}
          className="w-full"
        >
          Save-Data: {saveData ? "on" : "off"}
        </Button>
      </CardFooter>
    </Card>
  )
}
