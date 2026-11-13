'use client';

import { useState } from 'react';
import { useElementRef } from '@/hooks/useElementRef';

type TagOption = 'div' | 'section' | 'article';

const TAGS: TagOption[] = ['div', 'section', 'article'];

export default function UseElementRefDemo() {
  const [mounted, setMounted] = useState(true);
  const [tag, setTag] = useState<TagOption>('div');
  const [ref, element] = useElementRef<HTMLElement>();

  const Tag = tag;
  const activeTagIdx = TAGS.indexOf(tag);

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border bg-fd-card p-4 text-fd-card-foreground shadow-xs">
      <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-lg border bg-fd-muted/30">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        {mounted ? (
          <Tag
            key={tag}
            ref={ref}
            className="relative flex w-56 flex-col items-center justify-center gap-1.5 border border-fd-primary/30 bg-fd-card/85 px-4 py-3.5 shadow-2xs backdrop-blur-[2px] animate-in fade-in zoom-in-95 duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:animate-none"
          >
            <span className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary" />
            <span className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary" />
            <span className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary" />
            <span className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary" />

            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span className="font-mono text-sm font-semibold text-fd-foreground">
                {element ? `<${element.tagName.toLowerCase()}>` : 'mounting'}
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px] tabular-nums text-fd-muted-foreground">
              <span>
                {element
                  ? `${element.clientWidth}×${element.clientHeight}px`
                  : '0×0px'}
              </span>
              <span>·</span>
              <span>
                connected: {element?.isConnected ? 'true' : 'false'}
              </span>
            </div>
          </Tag>
        ) : (
          <div className="relative flex w-56 flex-col items-center justify-center gap-1.5 border border-dashed border-fd-border bg-fd-card/40 px-4 py-3.5">
            <span className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary/35" />
            <span className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary/35" />
            <span className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary/35" />
            <span className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary/35" />

            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-fd-muted-foreground/40" />
              <span className="font-mono text-sm font-semibold text-fd-muted-foreground">
                {element === null ? 'null' : `<${element.tagName.toLowerCase()}>`}
              </span>
            </div>

            <span className="font-mono text-[11px] text-fd-muted-foreground/70">
              detached from DOM
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <button
          type="button"
          onClick={() => setMounted((prev) => !prev)}
          className={`rounded-lg px-2.5 py-1 font-mono text-[11px] font-semibold transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
            mounted
              ? 'border bg-fd-muted/40 text-fd-card-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted/70'
              : 'bg-fd-primary/10 text-fd-primary [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/20'
          }`}
        >
          {mounted ? 'Unmount' : 'Mount'}
        </button>

        <div
          role="group"
          aria-label="HTML tag"
          className="relative grid grid-cols-3 rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/3)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activeTagIdx * 100}%, 0, 0)`,
            }}
          />
          {TAGS.map((option) => {
            const active = tag === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setTag(option);
                  if (!mounted) setMounted(true);
                }}
                className={`relative z-10 rounded-md px-2 py-0.5 font-mono text-[11px] font-medium transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
                  active
                    ? 'text-fd-foreground'
                    : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-foreground'
                }`}
              >
                {`<${option}>`}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
