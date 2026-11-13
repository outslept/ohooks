'use client';

import { type DragEvent as ReactDragEvent, useState } from 'react';
import { useDropZone } from '@/hooks/useDropZone';

type AcceptFilter = '*/*' | 'image/*';

const ACCEPT_OPTIONS: { value: AcceptFilter; label: string }[] = [
  { value: '*/*', label: '*/*' },
  { value: 'image/*', label: 'image/*' },
];

export default function UseDropZoneDemo() {
  const [accept, setAccept] = useState<AcceptFilter>('image/*');
  const [rejectedName, setRejectedName] = useState<string | null>(null);

  const { isOver, isInvalid, files, clearFiles, getRootProps } = useDropZone({
    accept,
    multiple: true,
    onDrop: () => {
      setRejectedName(null);
    },
    onDropRejected: (rejected) => {
      setRejectedName(rejected[0]?.name ?? 'file');
    },
  });

  const rootProps = getRootProps();

  const simulateDrop = (name: string, type: string, sizeBytes: number) => {
    if (typeof DataTransfer === 'undefined') return;
    const dt = new DataTransfer();
    const content = new Uint8Array(sizeBytes);
    dt.items.add(new File([content], name, { type }));

    rootProps.onDrop({
      preventDefault() {},
      stopPropagation() {},
      dataTransfer: dt,
    } as unknown as ReactDragEvent<HTMLElement>);
  };

  const handleClear = () => {
    clearFiles();
    setRejectedName(null);
  };

  const activeAcceptIdx = ACCEPT_OPTIONS.findIndex((o) => o.value === accept);
  const latestFile = files[files.length - 1];
  const hasDanger = isInvalid || rejectedName !== null;

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border bg-fd-card p-4 text-fd-card-foreground shadow-xs">
      <div
        {...rootProps}
        className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-lg border bg-fd-muted/30 select-none"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        <div
          style={{
            transform: isOver ? 'scale3d(1.03, 1.03, 1)' : 'scale3d(1, 1, 1)',
          }}
          className={`relative flex w-60 flex-col items-center justify-center gap-1.5 border bg-fd-card/85 px-4 py-3.5 shadow-2xs backdrop-blur-[2px] transition-[transform,border-color,background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none ${
            hasDanger
              ? 'border-red-500/40'
              : isOver
                ? 'border-fd-primary/60'
                : 'border-fd-primary/25'
          }`}
        >
          <span
            className={`pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 transition-opacity duration-150 ease-out ${
              hasDanger ? 'border-red-500' : 'border-fd-primary'
            }`}
            style={{ opacity: isOver || latestFile || rejectedName ? 1 : 0.4 }}
          />
          <span
            className={`pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 transition-opacity duration-150 ease-out ${
              hasDanger ? 'border-red-500' : 'border-fd-primary'
            }`}
            style={{ opacity: isOver || latestFile || rejectedName ? 1 : 0.4 }}
          />
          <span
            className={`pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 transition-opacity duration-150 ease-out ${
              hasDanger ? 'border-red-500' : 'border-fd-primary'
            }`}
            style={{ opacity: isOver || latestFile || rejectedName ? 1 : 0.4 }}
          />
          <span
            className={`pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 transition-opacity duration-150 ease-out ${
              hasDanger ? 'border-red-500' : 'border-fd-primary'
            }`}
            style={{ opacity: isOver || latestFile || rejectedName ? 1 : 0.4 }}
          />

          {isOver ? (
            <div className="flex flex-col items-center gap-1">
              <span
                className={`font-mono text-xs font-semibold tracking-wider uppercase ${
                  isInvalid ? 'text-red-500' : 'text-fd-primary'
                }`}
              >
                {isInvalid ? 'Invalid MIME' : 'Release to drop'}
              </span>
              <span className="font-mono text-[11px] text-fd-muted-foreground">
                accept: {accept}
              </span>
            </div>
          ) : rejectedName ? (
            <div
              key={`rejected-${rejectedName}`}
              className="flex w-full flex-col items-center gap-1 animate-in fade-in zoom-in-95 duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:animate-none"
            >
              <div className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-red-500" />
                <span className="max-w-[180px] truncate font-mono text-xs font-semibold text-red-500">
                  {rejectedName}
                </span>
              </div>
              <span className="font-mono text-[10px] text-fd-muted-foreground">
                rejected (requires {accept})
              </span>
            </div>
          ) : latestFile ? (
            <div
              key={`${latestFile.name}-${files.length}`}
              className="flex w-full flex-col items-center gap-1 animate-in fade-in zoom-in-95 duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:animate-none"
            >
              <div className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <span className="max-w-[160px] truncate font-mono text-xs font-semibold text-fd-foreground">
                  {latestFile.name}
                </span>
                {files.length > 1 && (
                  <span className="rounded bg-fd-primary/15 px-1 py-0.2 font-mono text-[10px] font-semibold tabular-nums text-fd-primary">
                    +{files.length - 1}
                  </span>
                )}
              </div>
              <span className="font-mono text-[11px] tabular-nums text-fd-muted-foreground">
                {latestFile.type || 'unknown'} ·{' '}
                {Math.max(1, Math.round(latestFile.size / 1024))} KB
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <span className="font-mono text-xs font-semibold tracking-tight text-fd-foreground">
                DROP FILES HERE
              </span>
              <span className="font-mono text-[11px] text-fd-muted-foreground">
                accept: {accept}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => simulateDrop('frame.png', 'image/png', 18432)}
            className="rounded-lg bg-fd-primary/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-fd-primary transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/20 motion-reduce:transition-none"
          >
            Drop .png
          </button>
          <button
            type="button"
            onClick={() =>
              simulateDrop('config.json', 'application/json', 4096)
            }
            className="rounded-lg border bg-fd-muted/40 px-2.5 py-1 font-mono text-[11px] font-medium text-fd-card-foreground transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted/70 motion-reduce:transition-none"
          >
            Drop .json
          </button>
          {(files.length > 0 || rejectedName !== null) && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-lg border bg-fd-muted/40 px-2 py-1 font-mono text-[11px] font-medium text-fd-muted-foreground transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted/70 [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-foreground motion-reduce:transition-none"
            >
              Clear
            </button>
          )}
        </div>

        <div
          role="group"
          aria-label="Accepted MIME filter"
          className="relative grid grid-cols-2 rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/2)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activeAcceptIdx * 100}%, 0, 0)`,
            }}
          />
          {ACCEPT_OPTIONS.map((option) => {
            const active = accept === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setAccept(option.value);
                  setRejectedName(null);
                }}
                className={`relative z-10 rounded-md px-2 py-0.5 font-mono text-[11px] font-medium transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
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
