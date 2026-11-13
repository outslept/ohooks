'use client';

import { useEffect, useState } from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

function TitleUpdater({ title }: { title: string }) {
  useDocumentTitle(title, { restoreOnUnmount: true });
  return null;
}

const MOUNT_MODES = [
  { value: true, label: 'Mounted' },
  { value: false, label: 'Unmounted' },
] as const;

export default function UseDocumentTitleDemo() {
  const [unread, setUnread] = useState(3);
  const [isMounted, setIsMounted] = useState(true);
  const [docTitle, setDocTitle] = useState<string>('');

  const targetTitle =
    unread > 0 ? `(${unread}) Inbox — Hooks` : 'Inbox — Hooks';

  useEffect(() => {
    if (typeof document !== 'undefined') {
      setDocTitle(document.title);
    }
  }, [targetTitle, isMounted]);

  const activeModeIdx = isMounted ? 0 : 1;

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border bg-fd-card p-4 text-fd-card-foreground shadow-xs">
      {isMounted && <TitleUpdater title={targetTitle} />}

      <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-lg border bg-fd-muted/30">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        <div className="relative flex w-64 flex-col gap-1.5 border border-fd-primary/25 bg-fd-card/85 px-4 py-3 shadow-2xs backdrop-blur-[2px]">
          <span
            className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isMounted ? 1 : 0.35 }}
          />
          <span
            className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isMounted ? 1 : 0.35 }}
          />
          <span
            className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isMounted ? 1 : 0.35 }}
          />
          <span
            className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isMounted ? 1 : 0.35 }}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span
                className={`size-1.5 rounded-full transition-colors duration-150 ease-out ${
                  isMounted ? 'bg-emerald-500' : 'bg-fd-muted-foreground/40'
                }`}
              />
              <span className="font-mono text-[10px] tracking-wider uppercase text-fd-muted-foreground">
                document.title
              </span>
            </div>

            <span
              className={`rounded px-1.5 py-0.2 font-mono text-[10px] font-semibold tabular-nums transition-colors duration-150 ease-out ${
                isMounted
                  ? 'bg-fd-primary/15 text-fd-primary'
                  : 'bg-fd-muted text-fd-muted-foreground'
              }`}
            >
              {isMounted ? `unread: ${unread}` : 'restored'}
            </span>
          </div>

          <div className="truncate font-mono text-xs font-semibold tabular-nums text-fd-foreground">
            {docTitle || targetTitle}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setUnread((n) => Math.max(0, n - 1))}
            disabled={!isMounted || unread === 0}
            className="rounded-lg border bg-fd-muted/40 px-2.5 py-1 font-mono text-[11px] font-medium tabular-nums text-fd-card-foreground transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted/70 motion-reduce:transition-none"
          >
            -1
          </button>
          <button
            type="button"
            onClick={() => setUnread((n) => n + 1)}
            disabled={!isMounted}
            className="rounded-lg bg-fd-primary/10 px-2.5 py-1 font-mono text-[11px] font-semibold tabular-nums text-fd-primary transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/20 motion-reduce:transition-none"
          >
            +1
          </button>
          <button
            type="button"
            onClick={() => setUnread(0)}
            disabled={!isMounted || unread === 0}
            className="rounded-lg border bg-fd-muted/40 px-2.5 py-1 font-mono text-[11px] font-medium text-fd-muted-foreground transition-[transform,background-color,color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted/70 [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-foreground motion-reduce:transition-none"
          >
            Clear
          </button>
        </div>

        <div
          role="group"
          aria-label="Hook mount state"
          className="relative grid grid-cols-2 rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/2)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activeModeIdx * 100}%, 0, 0)`,
            }}
          />
          {MOUNT_MODES.map((mode) => {
            const active = isMounted === mode.value;
            return (
              <button
                key={String(mode.value)}
                type="button"
                onClick={() => setIsMounted(mode.value)}
                className={`relative z-10 rounded-md px-2 py-0.5 font-mono text-[11px] font-medium transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
                  active
                    ? 'text-fd-foreground'
                    : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-foreground'
                }`}
              >
                {mode.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
