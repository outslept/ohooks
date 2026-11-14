"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "cn"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { usePagination } from "@/hooks/usePagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

const TOTAL_ITEMS = 95
const PAGE_SIZES = [5, 10, 20] as const

export default function UsePaginationDemo() {
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(10)
  const readoutRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)

  const {
    page,
    totalPages,
    items,
    hasPrevPage,
    hasNextPage,
    startIndex,
    endIndex,
    setPage,
    prevPage,
    nextPage,
    firstPage,
    lastPage,
  } = usePagination({
    totalItems: TOTAL_ITEMS,
    pageSize,
    siblingCount: 1,
    boundaryCount: 1,
  })

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (
      typeof window !== "undefined" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      readoutRef.current?.animate(
        [
          { transform: "scale3d(0.97, 0.97, 1)", opacity: 0.7 },
          { transform: "scale3d(1, 1, 1)", opacity: 1 },
        ],
        { duration: 180, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }
      )
    }
  }, [page, pageSize])

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">

        <div className="flex items-center justify-between gap-2">

          <div
            role="group"
            aria-label="Items per page"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {PAGE_SIZES.map((size) => {
              const isSelected = pageSize === size
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => setPageSize(size)}
                  className={cn(
                    "rounded-[3px] px-1.5 py-0.5 font-mono text-2xs tabular-nums transition-all",
                    isSelected
                      ? "bg-control text-foreground shadow-control"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {size}/p
                </button>
              )
            })}
          </div>
        </div>


        <div
          ref={readoutRef}
          className="flex flex-col items-center justify-center gap-2.5 rounded-md border border-border-subtle bg-subtle/35 p-3"
        >
          <div className="flex w-full items-center justify-between gap-2 border-b border-border-subtle pb-2">
            <Badge variant="code" size="compact" className="tabular-nums">
              [{startIndex}..{endIndex})
            </Badge>
            <Badge variant="accent" size="compact" className="tabular-nums">
              {startIndex + 1}–{endIndex} of {TOTAL_ITEMS}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1">
            {items.map((item, idx) =>
              item === "ellipsis" ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="inline-flex size-6 items-center justify-center font-mono text-xs text-muted-foreground select-none"
                >
                  …
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPage(item)}
                  aria-current={item === page ? "page" : undefined}
                  className={cn(
                    "inline-flex size-6 items-center justify-center rounded-sm border font-mono text-xs tabular-nums transition-all active:scale-[0.97]",
                    item === page
                      ? "border-primary/40 bg-primary/10 font-semibold text-primary"
                      : "border-border-subtle bg-card text-muted-foreground shadow-control hover:text-foreground"
                  )}
                >
                  {item}
                </button>
              )
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="justify-between gap-1.5 border-t">
        <div className="flex items-center gap-1">
          <Button
            variant="secondary"
            size="icon-compact"
            onClick={firstPage}
            disabled={!hasPrevPage}
            aria-label="First page"
          >
            <ChevronsLeft className="size-3.5" />
          </Button>
          <Button
            variant="secondary"
            size="icon-compact"
            onClick={prevPage}
            disabled={!hasPrevPage}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-3.5" />
          </Button>
        </div>

        <span className="font-mono text-2xs text-muted-foreground tabular-nums">
          {page} / {totalPages}
        </span>

        <div className="flex items-center gap-1">
          <Button
            variant="secondary"
            size="icon-compact"
            onClick={nextPage}
            disabled={!hasNextPage}
            aria-label="Next page"
          >
            <ChevronRight className="size-3.5" />
          </Button>
          <Button
            variant="secondary"
            size="icon-compact"
            onClick={lastPage}
            disabled={!hasNextPage}
            aria-label="Last page"
          >
            <ChevronsRight className="size-3.5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
