'use client';

import { Plus, RotateCcw } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTextareaAutosize } from '@/hooks/useTextareaAutosize';

const MAX_HEIGHT_OPTIONS = [72, 96, 120] as const;
const MIN_HEIGHT = 38;

const EXTRA_LINES = [
  'Measures scrollHeight in layout effect',
  'Clamps smoothly at maxHeight bound',
  'Enables overflow-y scroll when full',
  'Recalculates on window resize events',
];

export default function UseTextareaAutosizeDemo() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState('Auto-growing textarea primitive');
  const [maxHeight, setMaxHeight] = useState<number>(96);
  const [currentHeight, setCurrentHeight] = useState<number>(MIN_HEIGHT);

  const { resize } = useTextareaAutosize(textareaRef, value, {
    minHeight: MIN_HEIGHT,
    maxHeight,
    onResize: (height) => setCurrentHeight(Math.round(height)),
  });

  const lineCount = value ? value.split('\n').length : 1;
  const isClamped = currentHeight >= maxHeight;

  const handleAppendLine = () => {
    const nextLine = EXTRA_LINES[(lineCount - 1) % EXTRA_LINES.length];
    setValue((prev) =>
      prev.length > 0 ? `${prev}\nLine ${lineCount + 1}: ${nextLine}` : `Line 1: ${nextLine}`
    );
  };

  const handleReset = () => {
    setValue('');
    resize();
  };

  const maxIndex = Math.max(
    0,
    MAX_HEIGHT_OPTIONS.indexOf(maxHeight as (typeof MAX_HEIGHT_OPTIONS)[number])
  );

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

        <div className="relative flex w-80 max-w-[calc(100%-1.5rem)] flex-col gap-2 border border-fd-primary/25 bg-fd-card/70 p-2.5 shadow-2xs backdrop-blur-[2px]">
          <span
            className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isClamped ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isClamped ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isClamped ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isClamped ? 1 : 0.45 }}
          />

          <div className="flex items-center justify-between px-0.5">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-wider uppercase text-fd-muted-foreground">
              <span
                className={`size-1.5 rounded-full transition-colors duration-150 ease-out ${
                  isClamped ? 'bg-fd-primary' : 'bg-fd-muted-foreground/40'
                }`}
              />
              {isClamped ? 'max clamped' : 'auto-fit'}
            </span>
            <span className="font-mono text-[10px] tabular-nums text-fd-muted-foreground">
              { lineCount }L ·{' '}
              <span className="font-semibold text-fd-primary">
                {currentHeight}px
              </span>{' '}
              / {maxHeight}px
            </span>
          </div>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Type or add lines..."
            rows={1}
            className="w-full resize-none border border-fd-border/70 bg-fd-background/90 px-2.5 py-2 font-mono text-xs leading-relaxed text-fd-card-foreground focus:border-fd-primary/60 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleAppendLine}
            className="inline-flex items-center gap-1.5 rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15"
          >
            <Plus className="size-3" />
            Add Line
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={value.length === 0}
            className="inline-flex items-center gap-1 rounded-lg border bg-fd-muted/40 px-2.5 py-1 text-[11px] font-medium text-fd-card-foreground transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted"
          >
            <RotateCcw className="size-3" />
            Clear
          </button>
        </div>

        <div
          role="group"
          aria-label="Maximum textarea height"
          className="relative grid grid-cols-3 rounded-lg border bg-fd-muted/50 p-0.5"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/3)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${maxIndex * 100}%, 0, 0)`,
            }}
          />
          {MAX_HEIGHT_OPTIONS.map((px) => {
            const active = maxHeight === px;
            return (
              <button
                key={px}
                type="button"
                onClick={() => setMaxHeight(px)}
                className={`relative z-10 rounded-md px-2 py-0.5 font-mono text-[11px] font-medium tabular-nums transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
                  active
                    ? 'text-fd-card-foreground'
                    : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-card-foreground'
                }`}
              >
                {px}px
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
