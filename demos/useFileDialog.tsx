'use client';

import { useState } from 'react';
import { useFileDialog } from '@/hooks/useFileDialog';

const PRESET_OPTIONS = [
  { label: '* (multi)', accept: '*', multiple: true },
  { label: 'image/*', accept: 'image/*', multiple: true },
  { label: 'single', accept: '*', multiple: false },
] as const;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function UseFileDialogDemo() {
  const [presetIdx, setPresetIdx] = useState<number>(0);
  const [lastEvent, setLastEvent] = useState<'idle' | 'selected' | 'canceled'>(
    'idle',
  );

  const preset = PRESET_OPTIONS[presetIdx];

  const { files, open, reset } = useFileDialog({
    accept: preset.accept,
    multiple: preset.multiple,
    onChange: (list) => {
      setLastEvent(list && list.length > 0 ? 'selected' : 'idle');
    },
    onCancel: () => {
      setLastEvent('canceled');
    },
  });

  const fileArray = files ? Array.from(files) : [];
  const hasFiles = fileArray.length > 0;
  const totalBytes = fileArray.reduce((sum, f) => sum + f.size, 0);

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border bg-fd-card p-4 text-fd-card-foreground shadow-xs">
      <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-lg border bg-fd-muted/30 p-3">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        <div className="relative z-10 flex h-full w-full max-w-md flex-col border border-fd-primary/25 bg-fd-card/85 shadow-2xs backdrop-blur-[2px]">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-px -left-px z-20 size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: hasFiles ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-px -right-px z-20 size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: hasFiles ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-px -left-px z-20 size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: hasFiles ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-px -bottom-px z-20 size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: hasFiles ? 1 : 0.45 }}
          />

          <div className="flex items-center justify-between border-b border-fd-border/60 px-3 py-1.5 font-mono text-[10px] tabular-nums">
            <span className="font-semibold tracking-wider text-fd-muted-foreground uppercase">
              {lastEvent === 'canceled'
                ? 'dialog canceled'
                : `files (${fileArray.length})`}
            </span>
            <span className="text-fd-muted-foreground">
              {hasFiles ? formatBytes(totalBytes) : `accept: ${preset.accept}`}
            </span>
          </div>

          {hasFiles ? (
            <ul className="flex-1 space-y-1.5 overflow-y-auto p-2.5">
              {fileArray.map((file, idx) => (
                <li
                  key={`${file.name}-${file.lastModified}-${idx}`}
                  className="flex items-center justify-between gap-2 rounded-md border bg-fd-muted/35 px-2.5 py-1.5 font-mono text-[11px] tabular-nums animate-in fade-in zoom-in-95 duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:animate-none"
                >
                  <span className="truncate font-medium text-fd-card-foreground">
                    {file.name}
                  </span>
                  <span className="shrink-0 text-[10px] text-fd-muted-foreground">
                    {formatBytes(file.size)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <button
              type="button"
              onClick={() => open()}
              className="flex flex-1 flex-col items-center justify-center gap-1 font-mono text-xs text-fd-muted-foreground transition-[color,transform] duration-150 ease-out active:scale-[0.99] [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-card-foreground motion-reduce:transition-none"
            >
              <span className="font-medium text-fd-card-foreground">
                files: null
              </span>
              <span className="text-[10px]">click to open native picker</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => open()}
            className="rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15 motion-reduce:transition-none"
          >
            open()
          </button>
          <button
            type="button"
            onClick={() => {
              reset();
              setLastEvent('idle');
            }}
            disabled={!hasFiles}
            className="rounded-lg border bg-fd-muted/40 px-2.5 py-1 text-[11px] font-medium text-fd-card-foreground transition-[background-color,transform,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted/70 motion-reduce:transition-none"
          >
            reset()
          </button>
        </div>

        <div
          role="group"
          aria-label="File dialog preset options"
          className="relative grid grid-cols-3 rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/3)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${presetIdx * 100}%, 0, 0)`,
            }}
          />
          {PRESET_OPTIONS.map((option, idx) => {
            const active = presetIdx === idx;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => setPresetIdx(idx)}
                className={`relative z-10 rounded-md px-2 py-1 font-mono text-[11px] font-medium transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
                  active
                    ? 'text-fd-card-foreground'
                    : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-card-foreground'
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
