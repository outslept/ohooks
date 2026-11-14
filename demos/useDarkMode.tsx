"use client"

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react"

import {
  type ColorSchemePreference,
  useDarkMode,
} from "@/hooks/useDarkMode"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {cn} from "cn"

const PREFERENCES: { value: ColorSchemePreference; label: string }[] = [
  { value: "light", label: "light" },
  { value: "dark", label: "dark" },
  { value: "system", label: "system" },
]

export default function UseDarkModeDemo() {
  const {
    isDarkMode,
    preference,
    toggle,
    enable,
    disable,
    resetToSystem,
  } = useDarkMode({
    storageKey: "demo-dark-mode-pref",
    applyDarkClass: false,
  })

  const handleSelect = (next: ColorSchemePreference) => {
    if (next === "light") disable()
    else if (next === "dark") enable()
    else resetToSystem()
  }

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">

        <div className="flex items-center justify-between gap-2">

          <div
            role="group"
            aria-label="Color scheme preference"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {PREFERENCES.map((option) => {
              const active = preference === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
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


        <div
          className={cn(
            "flex items-center justify-between rounded-md border px-3.5 py-3 transition-colors duration-200 ease-out",
            isDarkMode
              ? "border-zinc-800 bg-zinc-950 text-zinc-100"
              : "border-zinc-200/90 bg-white text-zinc-900"
          )}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "flex size-7 items-center justify-center rounded-sm border transition-colors",
                isDarkMode
                  ? "border-zinc-800 bg-zinc-900 text-indigo-400"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-600"
              )}
            >
              {isDarkMode ? (
                <MoonIcon className="size-3.5" />
              ) : (
                <SunIcon className="size-3.5" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-xs font-semibold tracking-tight">
                {isDarkMode ? "Carbon Dark" : "Paper Light"}
              </span>
              <span className="font-mono text-3xs opacity-65">
                applyDarkClass: false
              </span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t">
        <Button
          variant="primary"
          size="compact"
          onClick={toggle}
          className="flex-1"
        >
          {isDarkMode ? <SunIcon /> : <MoonIcon />}
          Toggle Scheme
        </Button>
        <Button
          variant="tertiary"
          size="compact"
          onClick={resetToSystem}
          disabled={preference === "system"}
        >
          <MonitorIcon />
          System
        </Button>
      </CardFooter>
    </Card>
  )
}
