'use client';

import { Sparkles, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTextSelection } from '@/hooks/useTextSelection';

const SCOPES = ['scoped', 'global'] as const;
type ScopeMode = (typeof SCOPES)[number];

export default function UseTextSelectionDemo() {
  const [scope, setScope] = useState<ScopeMode>('scoped');
  const passageRef = useRef<HTMLParagraphElement>(null);

  const { text, rect, ranges } = useTextSelection(
    scope === 'scoped' ? passageRef : undefined
  );

  const trimmed = text.trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
  const hasSelection = text.length > 0;
  const rectWidth = rect ? Math.round(rect.width) : 0;
  const rectHeight = rect ? Math.round(rect.height) : 0;

  const selectSamplePhrase = () => {
    const el = passageRef.current;
    const textNode = el?.firstChild;
    if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return;

    const content = textNode.textContent ?? '';
    const targetPhrase = 'declarative primitives';
    const startIndex = content.indexOf(targetPhrase);
    if (startIndex === -1) return;

    const range = document.createRange();
    range.setStart(textNode, startIndex);
    range.setEnd(textNode, startIndex + targetPhrase.length);

    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(range);
    document.dispatchEvent(new Event('selectionchange'));
  };

  const clearSelection = () => {
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    document.dispatchEvent(new Event('selectionchange'));
  };

  const scopeIndex = SCOPES.indexOf(scope);

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

        <div className="relative flex w-80 max-w-[calc(100%-1.5rem)] flex-col gap-2.5 border border-fd-primary/25 bg-fd-card/70 p-3.5 shadow-2xs backdrop-blur-[2px]">
          <span
            className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: hasSelection ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: hasSelection ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: hasSelection ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: hasSelection ? 1 : 0.45 }}
          />

          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-wider uppercase text-fd-muted-foreground">
              <span
                className={`size-1.5 rounded-full transition-colors duration-150 ease-out ${
                  hasSelection ? 'bg-fd-primary' : 'bg-fd-muted-foreground/40'
                }`}
              />
              {hasSelection ? `${ranges.length} range` : 'idle'}
            </span>
            <span className="font-mono text-[10px] tabular-nums text-fd-muted-foreground">
              {rectWidth}×{rectHeight}px
            </span>
          </div>

          <p
            ref={passageRef}
            className="border-y border-fd-border/60 py-2 text-xs leading-relaxed text-fd-card-foreground selection:bg-fd-primary/20 selection:text-fd-primary"
          >
            React hooks compose browser APIs into declarative primitives with
            live bounding client rect coordinates.
          </p>

          <div className="flex items-center justify-between gap-2 text-[11px]">
            <span
              className={`truncate font-mono ${
                hasSelection
                  ? 'font-medium text-fd-primary'
                  : 'text-fd-muted-foreground'
              }`}
            >
              {hasSelection ? `"${text}"` : 'No active selection'}
            </span>
            <span className="shrink-0 font-mono text-[10px] tabular-nums text-fd-muted-foreground">
              {text.length}c · {wordCount}w
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={selectSamplePhrase}
            className="inline-flex items-center gap-1.5 rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15"
          >
            <Sparkles className="size-3" />
            Select Sample
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={clearSelection}
            disabled={!hasSelection}
            className="inline-flex items-center gap-1 rounded-lg border bg-fd-muted/40 px-2.5 py-1 text-[11px] font-medium text-fd-card-foreground transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted"
          >
            <X className="size-3" />
            Clear
          </button>
        </div>

        <div
          role="group"
          aria-label="Selection target scope"
          className="relative grid grid-cols-2 rounded-lg border bg-fd-muted/50 p-0.5"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/2)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${scopeIndex * 100}%, 0, 0)`,
            }}
          />
          {SCOPES.map((mode) => {
            const active = scope === mode;
            return (
              <button
                key={mode}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setScope(mode)}
                className={`relative z-10 rounded-md px-2.5 py-0.5 font-mono text-[11px] font-medium capitalize transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
                  active
                    ? 'text-fd-card-foreground'
                    : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-card-foreground'
                }`}
              >
                {mode}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
