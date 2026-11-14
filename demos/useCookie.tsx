"use client";

import { Trash2 } from "lucide-react";
import { useCookie } from "@/hooks/useCookie";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "cn";

const COOKIE_NAME = "demo_consent_tier";
const TIERS = ["essential", "analytics", "marketing"] as const;

export function UseCookieDemo() {
  const [cookieValue, setCookieValue, deleteCookie] = useCookie(COOKIE_NAME, {
    defaultValue: null,
    path: "/",
    sameSite: "lax",
  });

  const hasCookie = cookieValue !== null;

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="relative flex h-20 w-full flex-col items-center justify-center gap-1 rounded-md border border-border-subtle bg-subtle/35 px-3 text-center font-mono">
          <div
            key={cookieValue ?? "null"}
            className="animate-in fade-in zoom-in-95 text-base font-semibold tracking-tight text-foreground duration-150 ease-snappy"
          >
            {cookieValue ? `"${cookieValue}"` : "null"}
          </div>

          <span className="max-w-full truncate text-3xs text-muted-foreground">
            {hasCookie
              ? `${COOKIE_NAME}=${cookieValue}; path=/; samesite=lax`
              : "max-age=0 (expired)"}
          </span>
        </div>

        <div
          role="group"
          aria-label="Cookie consent tier"
          className="grid grid-cols-3 gap-1 rounded-md border border-border-subtle bg-subtle/60 p-0.5"
        >
          {TIERS.map((tier) => {
            const selected = cookieValue === tier;
            return (
              <button
                key={tier}
                type="button"
                onClick={() => setCookieValue(tier)}
                className={cn(
                  "rounded-xs py-1 text-center font-mono text-2xs font-medium outline-none select-none",
                  "transition-colors duration-150 ease-out",
                  selected
                    ? "bg-control text-foreground shadow-control"
                    : "text-muted-foreground pointer-hover:hover:text-foreground",
                  "focus-visible:ring-1 focus-visible:ring-ring"
                )}
              >
                {tier}
              </button>
            );
          })}
        </div>
      </CardContent>

      <CardFooter className="border-t">
        <Button
          size="compact"
          variant={hasCookie ? "destructive" : "secondary"}
          leadingIcon={Trash2}
          disabled={!hasCookie}
          onClick={() => deleteCookie()}
          className="w-full"
        >
          Delete cookie
        </Button>
      </CardFooter>
    </Card>
  );
}

export default UseCookieDemo;
