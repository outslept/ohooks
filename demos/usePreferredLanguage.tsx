"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "cn";
import { Languages } from "lucide-react";
import { usePreferredLanguage } from "@/hooks/usePreferredLanguage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

const MODES = [
  { id: "system", label: "System" },
  { id: "en-US", label: "en-US" },
  { id: "de-DE", label: "de-DE" },
  { id: "ja-JP", label: "ja-JP" },
] as const;

type ModeId = (typeof MODES)[number]["id"];

const REFERENCE_DATE = new Date(Date.UTC(2025, 3, 15, 12, 0, 0));

function applyBrowserLanguage(locale: ModeId) {
  if (typeof window === "undefined") return;

  if (locale === "system") {
    delete (window.navigator as { language?: string }).language;
  } else {
    Object.defineProperty(window.navigator, "language", {
      value: locale,
      configurable: true,
    });
  }

  window.dispatchEvent(new Event("languagechange"));
}

export default function UsePreferredLanguageDemo() {
  const language = usePreferredLanguage("en-US");
  const [mode, setMode] = useState<ModeId>("system");
  const frameRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        delete (window.navigator as { language?: string }).language;
        window.dispatchEvent(new Event("languagechange"));
      }
    };
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
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
        { duration: 220, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
      );
    }
  }, [language]);

  const selectMode = (nextMode: ModeId) => {
    setMode(nextMode);
    applyBrowserLanguage(nextMode);
  };

  const cycleMode = () => {
    const currentIndex = MODES.findIndex((item) => item.id === mode);
    const nextItem = MODES[(currentIndex + 1) % MODES.length];
    selectMode(nextItem.id);
  };

  const formatted = useMemo(() => {
    try {
      const displayNames = new Intl.DisplayNames([language], {
        type: "language",
      });
      const date = new Intl.DateTimeFormat(language, {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      }).format(REFERENCE_DATE);
      const number = new Intl.NumberFormat(language, {
        maximumFractionDigits: 2,
      }).format(12840.5);

      return {
        name: displayNames.of(language) ?? language,
        date,
        number,
      };
    } catch {
      return {
        name: language,
        date: "2025-04-15",
        number: "12,840.5",
      };
    }
  }, [language]);

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between gap-2">
          <div
            role="group"
            aria-label="Preferred language"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {MODES.map((item) => {
              const isSelected = mode === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectMode(item.id)}
                  className={cn(
                    "rounded-[3px] px-1.5 py-0.5 font-mono text-2xs transition-all",
                    isSelected
                      ? "bg-control text-foreground shadow-control"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div
          ref={frameRef}
          className="flex flex-col items-center justify-center gap-1.5 rounded-md border border-border-subtle bg-subtle/35 px-4 py-4"
        >
          <span className="font-mono text-2xl font-semibold tracking-tight text-foreground tabular-nums">
            {language}
          </span>
          <Badge variant="accent" size="compact" className="max-w-full truncate">
            {formatted.name}
          </Badge>
        </div>
      </CardContent>

      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="text-2xs font-medium tracking-wider text-muted-foreground uppercase">
            Date Format
          </span>
          <span className="truncate font-mono text-xs font-semibold text-foreground tabular-nums">
            {formatted.date}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="text-2xs font-medium tracking-wider text-muted-foreground uppercase">
            Number Format
          </span>
          <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
            {formatted.number}
          </span>
        </div>
      </div>

      <CardFooter className="border-t">
        <Button
          variant="secondary"
          size="compact"
          onClick={cycleMode}
          leadingIcon={Languages}
          className="w-full"
        >
          Cycle locale
        </Button>
      </CardFooter>
    </Card>
  );
}
