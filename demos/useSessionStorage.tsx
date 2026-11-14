"use client"

import { useSyncExternalStore } from "react"
import { cn } from "cn"
import { RefreshCw, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useSessionStorage } from "@/hooks/useSessionStorage"

interface CheckoutDraft {
  step: number
  coupon: string
}

const STORAGE_KEY = "fumadocs-demo-session-draft"
const STEPS = [1, 2, 3] as const
const COUPON_PRESETS = ["REACT2025", "SHIPFREE", "VIP50"] as const

function subscribeToSessionStorage(callback: () => void) {
  window.addEventListener("storage", callback)
  return () => window.removeEventListener("storage", callback)
}

function getHasStoredKeySnapshot(): boolean {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) !== null
  } catch {
    return false
  }
}

function getServerHasStoredKeySnapshot(): boolean {
  return false
}

export default function UseSessionStorageDemo() {
  const [draft, setDraft, removeDraft] = useSessionStorage<CheckoutDraft>(
    STORAGE_KEY,
    { step: 1, coupon: "REACT2025" }
  )

  const hasStoredKey = useSyncExternalStore(
    subscribeToSessionStorage,
    getHasStoredKeySnapshot,
    getServerHasStoredKeySnapshot
  )

  const handleCycleCoupon = () => {
    const currentIndex = COUPON_PRESETS.indexOf(
      draft.coupon as (typeof COUPON_PRESETS)[number]
    )
    const nextCoupon =
      COUPON_PRESETS[(currentIndex + 1) % COUPON_PRESETS.length]
    setDraft((prev) => ({ ...prev, coupon: nextCoupon }))
  }

  const handleRemove = () => {
    removeDraft()
  }

  const serialized = JSON.stringify(draft)

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between">

          <div
            role="group"
            aria-label="Wizard step"
            className="inline-flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {STEPS.map((step) => {
              const active = draft.step === step
              return (
                <button
                  key={step}
                  type="button"
                  onClick={() => setDraft((prev) => ({ ...prev, step }))}
                  className={cn(
                    "rounded-[3px] px-2 py-0.5 font-mono text-2xs font-medium tabular-nums transition-all",
                    active
                      ? "bg-control text-foreground shadow-control"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  S{step}
                </button>
              )
            })}
          </div>
        </div>

        <Input
          type="text"
          size="compact"
          value={draft.coupon}
          onChange={(e) =>
            setDraft((prev) => ({ ...prev, coupon: e.target.value }))
          }
          placeholder="PROMO"
          aria-label="Promo code"
          className="font-mono"
        />

        <div className="flex flex-col gap-1.5 rounded-md border border-border-subtle bg-subtle/35 p-2.5 font-mono">
          <div className="flex items-center justify-between">
            <span className="text-3xs tracking-wider text-muted-foreground uppercase">
              sessionStorage Payload
            </span>
            <Badge variant="code" size="compact" className="tabular-nums">
              {serialized.length}B
            </Badge>
          </div>
          <div className="truncate text-2xs text-primary">{serialized}</div>
        </div>
      </CardContent>

      <CardFooter className="border-t">
        <Button
          variant="primary"
          size="compact"
          leadingIcon={RefreshCw}
          onClick={handleCycleCoupon}
          className="flex-1"
        >
          Cycle Coupon
        </Button>
        <Button
          variant="secondary"
          size="compact"
          leadingIcon={Trash2}
          onClick={handleRemove}
          disabled={!hasStoredKey}
        >
          Remove
        </Button>
      </CardFooter>
    </Card>
  )
}
