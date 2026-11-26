"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "cn";
import { SlidersHorizontal } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

const CATEGORIES = [
  {
    id: "width",
    label: "width",
    variants: [
      "(min-width: 320px)",
      "(min-width: 768px)",
      "(min-width: 1280px)",
      "(min-width: 2560px)",
    ],
  },
  {
    id: "scheme",
    label: "scheme",
    variants: ["(prefers-color-scheme: dark)", "(prefers-color-scheme: light)"],
  },
  {
    id: "pointer",
    label: "pointer",
    variants: ["(pointer: fine)", "(pointer: coarse)"],
  },
  {
    id: "motion",
    label: "motion",
    variants: ["(prefers-reduced-motion: no-preference)", "(prefers-reduced-motion: reduce)"],
  },
] as const;

type CategoryId = (typeof CATEGORIES)[number]["id"];

export default function UseMediaQueryDemo() {
  const [categoryId, setCategoryId] = useState<CategoryId>("width");
  const [variantIndex, setVariantIndex] = useState(1);
  const frameRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  const activeCategory = CATEGORIES.find((item) => item.id === categoryId) ?? CATEGORIES[0];
  const query = activeCategory.variants[variantIndex % activeCategory.variants.length];

  const matches = useMediaQuery(query);

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
        { duration: 200, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
      );
    }
  }, [query, matches]);

  const selectCategory = (nextId: CategoryId) => {
    setCategoryId(nextId);
    setVariantIndex(0);
  };

  const cycleVariant = () => {
    setVariantIndex((idx) => (idx + 1) % activeCategory.variants.length);
  };

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between gap-2">
          <div
            role="group"
            aria-label="Media query category"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {CATEGORIES.map((item) => {
              const isSelected = categoryId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectCategory(item.id)}
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
          className="flex flex-col items-center justify-center gap-2.5 rounded-md border border-border-subtle bg-subtle/35 px-3 py-4"
        >
          <code className="max-w-full truncate font-mono text-xs font-semibold text-foreground tabular-nums">
            {query}
          </code>

          <Badge
            variant={matches ? "accent" : "secondary"}
            size="compact"
            className="font-mono uppercase"
          >
            matches: {String(matches)}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="border-t">
        <Button
          variant="secondary"
          size="compact"
          onClick={cycleVariant}
          leadingIcon={SlidersHorizontal}
          className="w-full tabular-nums"
        >
          Cycle query ({(variantIndex % activeCategory.variants.length) + 1}/
          {activeCategory.variants.length})
        </Button>
      </CardFooter>
    </Card>
  );
}
