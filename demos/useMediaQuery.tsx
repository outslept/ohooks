'use client';

import { useEffect, useRef, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const CATEGORIES = [
  {
    id: 'width',
    label: 'width',
    variants: [
      '(min-width: 320px)',
      '(min-width: 768px)',
      '(min-width: 1280px)',
      '(min-width: 2560px)',
    ],
  },
  {
    id: 'scheme',
    label: 'scheme',
    variants: [
      '(prefers-color-scheme: dark)',
      '(prefers-color-scheme: light)',
    ],
  },
  {
    id: 'pointer',
    label: 'pointer',
    variants: ['(pointer: fine)', '(pointer: coarse)'],
  },
  {
    id: 'motion',
    label: 'motion',
    variants: [
      '(prefers-reduced-motion: no-preference)',
      '(prefers-reduced-motion: reduce)',
    ],
  },
] as const;

type CategoryId = (typeof CATEGORIES)[number]['id'];

export default function UseMediaQueryDemo() {
  const [categoryId, setCategoryId] = useState<CategoryId>('width');
  const [variantIndex, setVariantIndex] = useState(1);
  const frameRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  const activeCategory =
    CATEGORIES.find((item) => item.id === categoryId) ?? CATEGORIES[0];
  const query =
    activeCategory.variants[variantIndex % activeCategory.variants.length];

  const matches = useMediaQuery(query);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (
      typeof window !== 'undefined' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      frameRef.current?.animate(
        [
          { transform: 'scale3d(0.97, 0.97, 1)', opacity: 0.75 },
          { transform: 'scale3d(1, 1, 1)', opacity: 1 },
        ],
        { duration: 200, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }
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

  const activeCategoryIndex = CATEGORIES.findIndex(
    (item) => item.id === categoryId
  );

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

        <div
          ref={frameRef}
          className="relative flex w-full max-w-xs flex-col items-center justify-center gap-2.5 border border-fd-primary/25 bg-fd-card/70 px-4 py-3.5 shadow-2xs backdrop-blur-[2px]"
        >
          <span
            className=" -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: matches ? 1 : 0.35 }}
          />
          <span
            className=" -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: matches ? 1 : 0.35 }}
          />
          <span
            className=" -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: matches ? 1 : 0.35 }}
          />
          <span
            className=" -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: matches ? 1 : 0.35 }}
          />

          <div className="flex items-center gap-1.5 text-[10px] font-medium tracking-wider text-fd-muted-foreground uppercase">
            <span
              className={`size-1.5 rounded-full transition-colors duration-150 ${
                matches ? 'bg-emerald-500' : 'bg-fd-muted-foreground/50'
              }`}
            />
            <span>window.matchMedia</span>
          </div>

          <code className="max-w-full truncate font-mono text-xs font-semibold text-fd-foreground tabular-nums">
            {query}
          </code>

          <span
            className={`inline-flex items-center rounded-md border px-2.5 py-0.5 font-mono text-xs font-bold tracking-wide uppercase ${
              matches
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
                : 'border-fd-border bg-fd-muted/50 text-fd-muted-foreground'
            }`}
          >
            matches: {String(matches)}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <button
          type="button"
          onClick={cycleVariant}
          className="inline-flex items-center gap-1.5 rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15"
        >
          <SlidersHorizontal className="size-3.5" />
          Cycle query ({(variantIndex % activeCategory.variants.length) + 1}/
          {activeCategory.variants.length})
        </button>

        <div
          role="group"
          aria-label="Media query category"
          className="relative grid grid-cols-4 items-center rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-0.25rem)/4)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activeCategoryIndex * 100}%, 0, 0)`,
            }}
          />
          {CATEGORIES.map((item) => {
            const isSelected = categoryId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectCategory(item.id)}
                className={`relative z-10 px-2 py-0.5 font-mono text-[11px] font-medium transition-[color,transform] duration-150 ease-out active:scale-[0.97] ${
                  isSelected
                    ? 'text-fd-foreground'
                    : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-foreground'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
