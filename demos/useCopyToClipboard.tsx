'use client';

import { useEffect, useRef, useState } from 'react';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

const RESET_OPTIONS = [
  { value: 1500, label: '1500ms' },
  { value: 3000, label: '3000ms' },
] as const;

export default function UseCopyToClipboardDemo() {
  const [text, setText] = useState('npx shadcn@latest add useCopyToClipboard');
  const [resetInterval, setResetInterval] = useState<number>(1500);
  const [copyPulse, setCopyPulse] = useState(0);

  const { isCopied, copiedText, copy, reset } = useCopyToClipboard({
    resetInterval,
  });

  const barRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<Animation | null>(null);

  useEffect(() => {
    const el = barRef.current;
    animRef.current?.cancel();

    if (!el || !isCopied) {
      return;
    }

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      return;
    }

    animRef.current = el.animate(
      [
        { transform: 'scale3d(1, 1, 1)' },
        { transform: 'scale3d(0, 1, 1)' },
      ],
      {
        duration: resetInterval,
        easing: 'linear',
      },
    );

    return () => {
      animRef.current?.cancel();
    };
  }, [isCopied, resetInterval, copyPulse]);

  const handleCopy = async () => {
    await copy(text);
    setCopyPulse((p) => p + 1);
  };

  const activeIntervalIdx = RESET_OPTIONS.findIndex(
    (o) => o.value === resetInterval,
  );

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border bg-fd-card p-4 text-fd-card-foreground shadow-xs">
      <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-lg border bg-fd-muted/30 px-3">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        <div className="relative flex w-full max-w-xs flex-col gap-2.5 border border-fd-primary/25 bg-fd-card/85 p-3.5 shadow-2xs backdrop-blur-[2px]">
          <span
            className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isCopied ? 1 : 0.4 }}
          />
          <span
            className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isCopied ? 1 : 0.4 }}
          />
          <span
            className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isCopied ? 1 : 0.4 }}
          />
          <span
            className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isCopied ? 1 : 0.4 }}
          />

          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-label="Text to copy"
            className="w-full rounded-md border bg-fd-background/80 px-2.5 py-1.5 font-mono text-xs text-fd-foreground focus:border-fd-primary focus:outline-none"
          />

          <div className="flex items-center justify-between gap-2 font-mono text-xs">
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="shrink-0 text-[10px] uppercase text-fd-muted-foreground">
                copied:
              </span>
              <span className="truncate font-semibold text-fd-foreground">
                {copiedText ?? 'null'}
              </span>
            </div>

            <span
              className={`shrink-0 rounded px-1.5 py-0.2 text-[10px] font-semibold tracking-wider uppercase transition-colors duration-150 ease-out ${
                isCopied
                  ? 'bg-emerald-500/15 text-emerald-500'
                  : 'bg-fd-muted text-fd-muted-foreground'
              }`}
            >
              {isCopied ? 'Copied' : 'Idle'}
            </span>
          </div>

          <div className="h-1 w-full overflow-hidden rounded-full bg-fd-muted">
            <div
              ref={barRef}
              className="h-full w-full origin-left bg-emerald-500"
              style={{
                transform: isCopied ? 'scale3d(1, 1, 1)' : 'scale3d(0, 1, 1)',
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-lg bg-fd-primary/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-fd-primary transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/20 motion-reduce:transition-none"
          >
            {isCopied ? 'Copied!' : 'Copy text'}
          </button>
          <button
            type="button"
            onClick={reset}
            disabled={!isCopied && copiedText === null}
            className="rounded-lg border bg-fd-muted/40 px-2.5 py-1 font-mono text-[11px] font-medium text-fd-card-foreground transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted/70 motion-reduce:transition-none"
          >
            Reset
          </button>
        </div>

        <div
          role="group"
          aria-label="Reset interval"
          className="relative grid grid-cols-2 rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/2)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activeIntervalIdx * 100}%, 0, 0)`,
            }}
          />
          {RESET_OPTIONS.map((option) => {
            const active = resetInterval === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setResetInterval(option.value)}
                className={`relative z-10 rounded-md px-2 py-0.5 font-mono text-[11px] font-medium tabular-nums transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
                  active
                    ? 'text-fd-foreground'
                    : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-foreground'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
