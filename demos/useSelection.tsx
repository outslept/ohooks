'use client';

import {
  Check,
  CheckSquare,
  Minus,
  RotateCcw,
  Square,
} from 'lucide-react';
import { useState } from 'react';
import { useSelection } from '@/hooks/useSelection';

const FILES = [
  'useSelection.ts',
  'useBoolean.ts',
  'useStorage.ts',
  'useMedia.ts',
] as const;

type FileItem = (typeof FILES)[number];
const MODES = ['multi', 'single'] as const;
type SelectionMode = (typeof MODES)[number];

export default function UseSelectionDemo() {
  const [mode, setMode] = useState<SelectionMode>('multi');
  const multiple = mode === 'multi';

  const {
    selectedKeys,
    isSelected,
    isAllSelected,
    isPartiallySelected,
    isNoneSelected,
    toggle,
    toggleAll,
    selectRange,
    clear,
    setSelectedKeys,
  } = useSelection<FileItem>(FILES, {
    defaultValue: ['useSelection.ts'],
    multiple,
  });

  const statusLabel = isAllSelected
    ? 'all selected'
    : isPartiallySelected
      ? 'indeterminate'
      : 'none selected';

  const modeIndex = MODES.indexOf(mode);

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
            style={{ opacity: !isNoneSelected ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: !isNoneSelected ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: !isNoneSelected ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: !isNoneSelected ? 1 : 0.45 }}
          />

          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-wider uppercase text-fd-muted-foreground">
              <span
                className={`size-1.5 rounded-full transition-colors duration-150 ease-out ${
                  !isNoneSelected
                    ? 'bg-fd-primary'
                    : 'bg-fd-muted-foreground/40'
                }`}
              />
              {statusLabel}
            </span>
            <span className="font-mono text-[10px] tabular-nums text-fd-muted-foreground">
              <strong className="text-fd-card-foreground">
                {selectedKeys.length}
              </strong>
              /{FILES.length} selected
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 border-y border-fd-border/60 py-2">
            {FILES.map((file) => {
              const checked = isSelected(file);
              return (
                <button
                  key={file}
                  type="button"
                  onClick={() => toggle(file)}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1.5 font-mono text-[11px] font-medium transition-[transform,color,background-color,border-color] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
                    checked
                      ? 'border-fd-primary/40 bg-fd-primary/15 text-fd-primary'
                      : 'border-fd-border/70 bg-fd-background/60 text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-card-foreground'
                  }`}
                >
                  <span
                    className={`flex size-3.5 shrink-0 items-center justify-center rounded-xs border transition-colors duration-150 ease-out ${
                      checked
                        ? 'border-fd-primary bg-fd-primary text-fd-primary-foreground'
                        : 'border-fd-muted-foreground/40 bg-fd-background'
                    }`}
                  >
                    {checked && <Check className="size-2.5" />}
                  </span>
                  <span className="truncate">{file}</span>
                </button>
              );
            })}
          </div>

          <div className="truncate font-mono text-[10px] tabular-nums text-fd-muted-foreground">
            {selectedKeys.length > 0
              ? `selectedKeys: [ ${selectedKeys.map((k) => `"${k}"`).join(', ')} ]`
              : 'selectedKeys: []'}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleAll}
            disabled={!multiple}
            className="inline-flex items-center gap-1.5 rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15"
          >
            {isAllSelected ? (
              <CheckSquare className="size-3" />
            ) : isPartiallySelected ? (
              <Minus className="size-3" />
            ) : (
              <Square className="size-3" />
            )}
            Toggle All
          </button>

          <button
            type="button"
            onClick={() => selectRange(FILES[0], FILES[2])}
            disabled={!multiple}
            className="rounded-lg border bg-fd-muted/40 px-2.5 py-1 text-[11px] font-medium text-fd-card-foreground transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted"
          >
            Range 1–3
          </button>

          <button
            type="button"
            onClick={clear}
            disabled={isNoneSelected}
            aria-label="Clear selection"
            className="inline-flex size-6 items-center justify-center rounded-lg border bg-fd-muted/40 text-fd-muted-foreground transition-[transform,color,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-card-foreground"
          >
            <RotateCcw className="size-3" />
          </button>
        </div>

        <div
          role="group"
          aria-label="Selection mode"
          className="relative grid grid-cols-2 rounded-lg border bg-fd-muted/50 p-0.5"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/2)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${modeIndex * 100}%, 0, 0)`,
            }}
          />
          {MODES.map((m) => {
            const active = mode === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  if (m === 'single' && selectedKeys.length > 1) {
                    setSelectedKeys([selectedKeys[0]]);
                  }
                }}
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
