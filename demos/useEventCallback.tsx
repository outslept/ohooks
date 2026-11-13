'use client';

import { memo, useRef, useState } from 'react';
import { useEventCallback } from '@/hooks/useEventCallback';

const MODE_OPTIONS = [
  { label: 'useEventCallback', stable: true },
  { label: 'inline () =>', stable: false },
] as const;

const MemoizedChild = memo(function MemoizedChild({
  onAction,
}: {
  onAction: () => void;
}) {
  const rendersRef = useRef(1);
  const lastActionRef = useRef(onAction);

  if (lastActionRef.current !== onAction) {
    lastActionRef.current = onAction;
    rendersRef.current += 1;
  }

  return (
    <div className="flex items-center justify-between gap-2 rounded-md border bg-fd-muted/35 px-2.5 py-1.5 font-mono text-[11px] tabular-nums">
      <span className="text-fd-muted-foreground">
        memo child renders:{' '}
        <strong className="text-fd-card-foreground">{rendersRef.current}</strong>
      </span>
      <button
        type="button"
        onClick={onAction}
        className="rounded bg-fd-primary/10 px-2 py-0.5 text-[11px] font-semibold text-fd-primary transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15 motion-reduce:transition-none"
      >
        Invoke fn()
      </button>
    </div>
  );
});

export default function UseEventCallbackDemo() {
  const [text, setText] = useState('Payload v1');
  const [parentEdits, setParentEdits] = useState(1);
  const [useStable, setUseStable] = useState(true);
  const [lastLogged, setLastLogged] = useState<string>('Payload v1');
  const [invocations, setInvocations] = useState(0);

  const stableAction = useEventCallback(() => {
    setLastLogged(text);
    setInvocations((c) => c + 1);
  });

  const inlineAction = () => {
    setLastLogged(text);
    setInvocations((c) => c + 1);
  };

  const activeCallback = useStable ? stableAction : inlineAction;
  const activeModeIdx = useStable ? 0 : 1;

  const updateText = (next: string) => {
    setText(next);
    setParentEdits((c) => c + 1);
  };

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border bg-fd-card p-4 text-fd-card-foreground shadow-xs">
      <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-lg border bg-fd-muted/30 px-4">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        <div className="relative z-10 flex w-full max-w-md flex-col gap-2.5 border border-fd-primary/25 bg-fd-card/85 p-3.5 shadow-2xs backdrop-blur-[2px]">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: useStable ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: useStable ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: useStable ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: useStable ? 1 : 0.45 }}
          />

          <div className="flex items-center justify-between gap-2 font-mono text-[10px] tabular-nums">
            <span className="font-semibold tracking-wider text-fd-muted-foreground uppercase">
              parent renders: <strong className="text-fd-card-foreground">{parentEdits}</strong>
            </span>
            <span className="truncate text-fd-muted-foreground">
              read (#{invocations}): <strong className="text-fd-primary">&quot;{lastLogged}&quot;</strong>
            </span>
          </div>

          <input
            type="text"
            value={text}
            onChange={(e) => updateText(e.target.value)}
            placeholder="Type to update parent state..."
            aria-label="Parent state text"
            className="h-8 w-full rounded-md border bg-fd-background px-2.5 text-xs text-fd-card-foreground placeholder:text-fd-muted-foreground focus:border-fd-primary focus:outline-none"
          />

          <MemoizedChild onAction={activeCallback} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => updateText(`Payload v${parentEdits + 1}`)}
            className="rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15 motion-reduce:transition-none"
          >
            Mutate parent
          </button>
          <button
            type="button"
            onClick={activeCallback}
            className="rounded-lg border bg-fd-muted/40 px-2.5 py-1 text-[11px] font-medium text-fd-card-foreground transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted/70 motion-reduce:transition-none"
          >
            Read latest
          </button>
        </div>

        <div
          role="group"
          aria-label="Callback reference stability mode"
          className="relative grid grid-cols-2 rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/2)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activeModeIdx * 100}%, 0, 0)`,
            }}
          />
          {MODE_OPTIONS.map((option) => {
            const active = useStable === option.stable;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => setUseStable(option.stable)}
                className={`relative z-10 rounded-md px-2.5 py-1 font-mono text-[11px] font-medium transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
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
