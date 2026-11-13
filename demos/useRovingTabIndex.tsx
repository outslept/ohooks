'use client';

import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Ban,
  Crosshair,
} from 'lucide-react';
import { useState } from 'react';
import { useRovingTabIndex } from '@/hooks/useRovingTabIndex';

const TOOLS = [
  { id: 'left', label: 'Left', icon: AlignLeft },
  { id: 'center', label: 'Center', icon: AlignCenter },
  { id: 'right', label: 'Right', icon: AlignRight },
  { id: 'justify', label: 'Justify', icon: AlignJustify },
] as const;

const LOOP_MODES = ['loop', 'clamp'] as const;
type LoopMode = (typeof LOOP_MODES)[number];

export default function UseRovingTabIndexDemo() {
  const [loopMode, setLoopMode] = useState<LoopMode>('loop');
  const [disableThird, setDisableThird] = useState(false);
  const [hasFocusWithin, setHasFocusWithin] = useState(false);
  const [lastKey, setLastKey] = useState<string>('none');

  const loop = loopMode === 'loop';

  const { activeIndex, focusItem, getItemProps } = useRovingTabIndex({
    orientation: 'horizontal',
    loop,
  });

  const loopIndex = LOOP_MODES.indexOf(loopMode);

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
          onFocusCapture={() => setHasFocusWithin(true)}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
              setHasFocusWithin(false);
            }
          }}
          className="relative flex w-80 max-w-[calc(100%-1.5rem)] flex-col gap-2.5 border border-fd-primary/25 bg-fd-card/70 p-3.5 shadow-2xs backdrop-blur-[2px]"
        >
          <span
            className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: hasFocusWithin ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: hasFocusWithin ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: hasFocusWithin ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: hasFocusWithin ? 1 : 0.45 }}
          />

          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-wider uppercase text-fd-muted-foreground">
              <span
                className={`size-1.5 rounded-full transition-colors duration-150 ease-out ${
                  hasFocusWithin ? 'bg-fd-primary' : 'bg-fd-muted-foreground/40'
                }`}
              />
              {hasFocusWithin ? 'roving active' : '← / → / home / end'}
            </span>
            <span className="font-mono text-[10px] tabular-nums text-fd-muted-foreground">
              index:{' '}
              <strong className="text-fd-primary">{activeIndex}</strong>
            </span>
          </div>

          <div
            role="toolbar"
            aria-label="Text alignment"
            className="grid grid-cols-4 gap-1.5 border-y border-fd-border/60 py-2"
          >
            {TOOLS.map((tool, index) => {
              const Icon = tool.icon;
              const isItemDisabled = index === 2 && disableThird;
              const isActive = activeIndex === index && !isItemDisabled;
              const itemProps = getItemProps<HTMLButtonElement>(index, {
                disabled: isItemDisabled,
                onKeyDown: (e) => {
                  if (
                    e.key === 'ArrowLeft' ||
                    e.key === 'ArrowRight' ||
                    e.key === 'Home' ||
                    e.key === 'End'
                  ) {
                    setLastKey(e.key);
                  }
                },
              });

              return (
                <button
                  key={tool.id}
                  type="button"
                  {...itemProps}
                  disabled={isItemDisabled}
                  aria-label={tool.label}
                  className={`flex flex-col items-center justify-center gap-1 border py-1.5 font-mono transition-transform duration-100 ease-out focus-visible:ring-1 focus-visible:ring-fd-primary focus-visible:outline-none active:scale-[0.97] disabled:pointer-events-none disabled:opacity-35 motion-reduce:transition-none ${
                    isActive
                      ? 'border-fd-primary/50 bg-fd-primary/15 text-fd-primary'
                      : 'border-fd-border/70 bg-fd-background/70 text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-card-foreground'
                  }`}
                >
                  <Icon className="size-3.5" />
                  <span className="text-[10px] font-medium">{tool.label}</span>
                  <span className="text-[9px] tabular-nums opacity-75">
                    tab={itemProps.tabIndex}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between font-mono text-[10px] tabular-nums text-fd-muted-foreground">
            <span>
              key: <strong className="text-fd-card-foreground">{lastKey}</strong>
            </span>
            <span>{disableThird ? 'item #2 skipped' : 'all 4 enabled'}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => focusItem(activeIndex)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15"
          >
            <Crosshair className="size-3" />
            Focus Toolbar
          </button>

          <button
            type="button"
            onClick={() => setDisableThird((prev) => !prev)}
            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-[transform,color,background-color,border-color] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
              disableThird
                ? 'border-fd-primary/40 bg-fd-primary/10 text-fd-primary'
                : 'bg-fd-muted/40 text-fd-card-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted'
            }`}
          >
            <Ban className="size-3" />
            {disableThird ? 'Enable #3' : 'Disable #3'}
          </button>
        </div>

        <div
          role="group"
          aria-label="Roving boundary behavior"
          className="relative grid grid-cols-2 rounded-lg border bg-fd-muted/50 p-0.5"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/2)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${loopIndex * 100}%, 0, 0)`,
            }}
          />
          {LOOP_MODES.map((m) => {
            const active = loopMode === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setLoopMode(m)}
                className={`relative z-10 rounded-md px-2.5 py-0.5 font-mono text-[11px] font-medium capitalize transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
                  active
                    ? 'text-fd-card-foreground'
                    : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-card-foreground'
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
