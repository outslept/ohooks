'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Sparkles, Trash2 } from 'lucide-react';
import { useObjectUrl } from '@/hooks/useObjectUrl';

const PATTERNS = [
  { id: 'grid', label: 'grid', hue: 195 },
  { id: 'rings', label: 'rings', hue: 262 },
  { id: 'wave', label: 'wave', hue: 152 },
] as const;

type PatternId = (typeof PATTERNS)[number]['id'];

function createSvgMarkup(pattern: PatternId, seed: number): string {
  const baseHue =
    (PATTERNS.find((item) => item.id === pattern)?.hue ?? 200) +
    ((seed * 23) % 45);

  const shape =
    pattern === 'grid'
      ? `<path d="M0 18 H220 M0 36 H220 M44 0 V54 M88 0 V54 M132 0 V54 M176 0 V54" stroke="hsla(${baseHue},85%,75%,0.28)" stroke-width="1"/>`
      : pattern === 'rings'
        ? `<circle cx="110" cy="27" r="12" fill="none" stroke="hsla(${baseHue},90%,78%,0.45)" stroke-width="1.5"/><circle cx="110" cy="27" r="24" fill="none" stroke="hsla(${baseHue},90%,78%,0.28)" stroke-width="1.5"/><circle cx="110" cy="27" r="38" fill="none" stroke="hsla(${baseHue},90%,78%,0.16)" stroke-width="1.5"/>`
        : `<path d="M0 32 Q 27.5 10, 55 32 T 110 32 T 165 32 T 220 32" fill="none" stroke="hsla(${baseHue},90%,76%,0.5)" stroke-width="2"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 54" width="220" height="54"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="hsl(${baseHue} 75% 22%)"/><stop offset="100%" stop-color="hsl(${(baseHue + 35) % 360} 80% 14%)"/></linearGradient></defs><rect width="220" height="54" fill="url(#g)"/>${shape}</svg>`;
}

export default function UseObjectUrlDemo() {
  const [pattern, setPattern] = useState<PatternId>('grid');
  const [seed, setSeed] = useState(1);
  const [blob, setBlob] = useState<Blob | null>(() => {
    const svg = createSvgMarkup('grid', 1);
    return new Blob([svg], { type: 'image/svg+xml' });
  });

  const objectUrl = useObjectUrl(blob);
  const frameRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  const mintBlob = useCallback((nextPattern: PatternId, nextSeed: number) => {
    const svg = createSvgMarkup(nextPattern, nextSeed);
    setBlob(new Blob([svg], { type: 'image/svg+xml' }));
  }, []);

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
  }, [objectUrl]);

  const handleGenerate = () => {
    const nextSeed = seed + 1;
    setSeed(nextSeed);
    mintBlob(pattern, nextSeed);
  };

  const handleSelectPattern = (nextPattern: PatternId) => {
    const nextSeed = seed + 1;
    setPattern(nextPattern);
    setSeed(nextSeed);
    mintBlob(nextPattern, nextSeed);
  };

  const shortToken = objectUrl
    ? `blob:…/${objectUrl.split('/').pop()?.slice(-8) ?? ''}`
    : 'null (revoked)';

  const activePatternIndex = PATTERNS.findIndex((item) => item.id === pattern);

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border bg-fd-card p-4 text-fd-card-foreground shadow-xs">
      <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-lg border bg-fd-muted/30">
        <div
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        <div
          ref={frameRef}
          className="relative flex w-64 flex-col items-center justify-center gap-2 border border-fd-primary/25 bg-fd-card/70 p-3 shadow-2xs backdrop-blur-[2px]"
        >
          <span
            className=" -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: objectUrl ? 1 : 0.35 }}
          />
          <span
            className=" -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: objectUrl ? 1 : 0.35 }}
          />
          <span
            className=" -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: objectUrl ? 1 : 0.35 }}
          />
          <span
            className=" -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: objectUrl ? 1 : 0.35 }}
          />

          <div
            className="flex h-14 w-full items-center justify-center overflow-hidden border border-fd-border/70 bg-fd-muted/40 bg-cover bg-center font-mono text-[11px] text-fd-muted-foreground"
            style={{
              backgroundImage: objectUrl ? `url("${objectUrl}")` : undefined,
            }}
          >
            {!objectUrl && <span>No active Blob</span>}
          </div>

          <div className="flex w-full items-center justify-between font-mono text-[11px] tabular-nums">
            <span
              className={`truncate ${
                objectUrl ? 'text-fd-foreground' : 'text-fd-muted-foreground'
              }`}
            >
              {shortToken}
            </span>
            <span className="shrink-0 text-fd-muted-foreground">
              {blob ? `${blob.size} B` : '0 B'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleGenerate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15"
          >
            <Sparkles className="size-3.5" />
            Mint Blob
          </button>
          <button
            type="button"
            onClick={() => setBlob(null)}
            disabled={!blob}
            className="inline-flex items-center gap-1 rounded-lg border bg-fd-muted/40 px-2.5 py-1 text-[11px] font-medium text-fd-card-foreground transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted"
          >
            <Trash2 className="size-3 text-fd-muted-foreground" />
            Revoke
          </button>
        </div>

        <div
          role="group"
          aria-label="Blob SVG preset"
          className="relative grid grid-cols-3 items-center rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-0.25rem)/3)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activePatternIndex * 100}%, 0, 0)`,
            }}
          />
          {PATTERNS.map((item) => {
            const isSelected = pattern === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectPattern(item.id)}
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
