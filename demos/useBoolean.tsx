'use client';

import { useBoolean } from '@/hooks/useBoolean';

const BOOL_OPTIONS = [
  { value: true, label: 'setTrue' },
  { value: false, label: 'setFalse' },
] as const;

export default function UseBooleanDemo() {
  const { value, setValue, setTrue, setFalse, toggle } = useBoolean(true);

  const activeIdx = value ? 0 : 1;

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border bg-fd-card p-4 text-fd-card-foreground shadow-xs">
      <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-lg border bg-fd-muted/30">
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
            transform: value ? 'scale3d(1, 1, 1)' : 'scale3d(0.97, 0.97, 1)',
          }}
          className={`relative flex w-52 flex-col items-center justify-center gap-2.5 border bg-fd-card/85 px-4 py-3.5 shadow-2xs backdrop-blur-[2px] transition-[transform,border-color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none ${
            value ? 'border-fd-primary/35' : 'border-fd-border'
          }`}
        >
          <span
            className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: value ? 1 : 0.35 }}
          />
          <span
            className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: value ? 1 : 0.35 }}
          />
          <span
            className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: value ? 1 : 0.35 }}
          />
          <span
            className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: value ? 1 : 0.35 }}
          />

          <div className="flex items-center gap-2">
            <span
              className={`size-2 rounded-full transition-colors duration-150 ease-out ${
                value ? 'bg-emerald-500' : 'bg-fd-muted-foreground/40'
              }`}
            />
            <span className="font-mono text-lg font-semibold tracking-tight text-fd-foreground">
              {String(value)}
            </span>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={value}
            aria-label="Toggle boolean via setValue"
            onClick={() => setValue((prev) => !prev)}
            className={`relative h-5 w-9 rounded-full border p-0.5 transition-colors duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
              value
                ? 'border-fd-primary/40 bg-fd-primary/20'
                : 'border-fd-border bg-fd-muted'
            }`}
          >
            <span
              className={`block size-3.5 rounded-full transition-[transform,background-color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none ${
                value ? 'bg-fd-primary' : 'bg-fd-muted-foreground/60'
              }`}
              style={{
                transform: `translate3d(${value ? 16 : 0}px, 0, 0)`,
              }}
            />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <button
          type="button"
          onClick={toggle}
          className="rounded-lg bg-fd-primary/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-fd-primary transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/20 motion-reduce:transition-none"
        >
          toggle()
        </button>

        <div
          role="group"
          aria-label="Explicit boolean setters"
          className="relative grid grid-cols-2 rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/2)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activeIdx * 100}%, 0, 0)`,
            }}
          />
          {BOOL_OPTIONS.map((option) => {
            const active = value === option.value;
            return (
              <button
                key={option.label}
                type="button"
                onClick={option.value ? setTrue : setFalse}
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
