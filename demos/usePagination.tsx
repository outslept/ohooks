'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';

const TOTAL_ITEMS = 95;
const PAGE_SIZES = [5, 10, 20] as const;

export default function UsePaginationDemo() {
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(10);
  const readoutRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

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
  });

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (
      typeof window !== 'undefined' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      readoutRef.current?.animate(
        [
          { transform: 'scale3d(0.97, 0.97, 1)', opacity: 0.7 },
          { transform: 'scale3d(1, 1, 1)', opacity: 1 },
        ],
        { duration: 180, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }
      );
    }
  }, [page, pageSize]);

  const activeSizeIndex = PAGE_SIZES.indexOf(pageSize);

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border bg-fd-card p-4 text-fd-card-foreground shadow-xs">
      <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-lg border bg-fd-muted/30 px-3">
        <div
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        <div className="relative flex w-full max-w-xs flex-col items-center justify-center gap-3 border border-fd-primary/25 bg-fd-card/70 px-4 py-3.5 shadow-2xs backdrop-blur-[2px]">
          <span className=" -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary" />
          <span className=" -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary" />
          <span className=" -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary" />
          <span className=" -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary" />

          <div
            ref={readoutRef}
            className="flex w-full items-center justify-between border-b border-fd-border/60 pb-2 font-mono text-[11px] tabular-nums"
          >
            <span className="text-fd-muted-foreground">
              PAGE{' '}
              <span className="font-bold text-fd-foreground">{page}</span>/
              {totalPages}
            </span>
            <span className="text-fd-muted-foreground">
              [{startIndex}..{endIndex}){' '}
              <span className="text-fd-foreground">
                ({startIndex + 1}–{endIndex} of {TOTAL_ITEMS})
              </span>
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1">
            {items.map((item, idx) =>
              item === 'ellipsis' ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="inline-flex size-7 select-none items-center justify-center font-mono text-xs text-fd-muted-foreground"
                >
                  …
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPage(item)}
                  aria-current={item === page ? 'page' : undefined}
                  className={`inline-flex size-7 items-center justify-center rounded-md border font-mono text-xs tabular-nums transition-[transform,background-color,color,border-color] duration-150 ease-out active:scale-[0.97] ${
                    item === page
                      ? 'border-fd-primary/40 bg-fd-primary/15 font-bold text-fd-primary'
                      : 'border-fd-border bg-fd-card/80 text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-foreground'
                  }`}
                >
                  {item}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={firstPage}
            disabled={!hasPrevPage}
            aria-label="First page"
            className="inline-flex size-6 items-center justify-center rounded-md border bg-fd-muted/40 text-fd-card-foreground transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted"
          >
            <ChevronsLeft className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={prevPage}
            disabled={!hasPrevPage}
            aria-label="Previous page"
            className="inline-flex size-6 items-center justify-center rounded-md border bg-fd-muted/40 text-fd-card-foreground transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={nextPage}
            disabled={!hasNextPage}
            aria-label="Next page"
            className="inline-flex size-6 items-center justify-center rounded-md border bg-fd-muted/40 text-fd-card-foreground transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted"
          >
            <ChevronRight className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={lastPage}
            disabled={!hasNextPage}
            aria-label="Last page"
            className="inline-flex size-6 items-center justify-center rounded-md border bg-fd-muted/40 text-fd-card-foreground transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted"
          >
            <ChevronsRight className="size-3.5" />
          </button>
        </div>

        <div
          role="group"
          aria-label="Items per page"
          className="relative grid grid-cols-3 items-center rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-0.25rem)/3)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activeSizeIndex * 100}%, 0, 0)`,
            }}
          />
          {PAGE_SIZES.map((size) => {
            const isSelected = pageSize === size;
            return (
              <button
                key={size}
                type="button"
                onClick={() => setPageSize(size)}
                className={`relative z-10 px-2 py-0.5 font-mono text-[11px] font-medium tabular-nums transition-[color,transform] duration-150 ease-out active:scale-[0.97] ${
                  isSelected
                    ? 'text-fd-foreground'
                    : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-foreground'
                }`}
              >
                {size}/p
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
