'use client';

import { useState } from 'react';
import { useFirstMountState } from '@/hooks/useFirstMountState';

interface ProbeCardProps {
  instanceId: number;
  renderPass: number;
}

function ProbeCard({ instanceId, renderPass }: ProbeCardProps) {
  const isFirstMount = useFirstMountState();

  return (
    <div
      style={{
        transform: isFirstMount
          ? 'scale3d(1, 1, 1)'
          : 'scale3d(0.985, 0.985, 1)',
      }}
      className={`relative z-10 flex w-full max-w-sm flex-col gap-2.5 border p-4 shadow-2xs backdrop-blur-[2px] transition-[transform,border-color,background-color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] animate-in fade-in zoom-in-95 motion-reduce:transition-none motion-reduce:animate-none ${
        isFirstMount
          ? 'border-fd-primary/60 bg-fd-primary/10'
          : 'border-fd-primary/25 bg-fd-card/85'
      }`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
        style={{ opacity: isFirstMount ? 1 : 0.45 }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
        style={{ opacity: isFirstMount ? 1 : 0.45 }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
        style={{ opacity: isFirstMount ? 1 : 0.45 }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
        style={{ opacity: isFirstMount ? 1 : 0.45 }}
      />

      <div className="flex items-center justify-between border-b border-fd-border/60 pb-1.5">
        <div className="flex items-center gap-1.5">
          <span
            className={`size-2 rounded-full transition-colors duration-150 ease-out ${
              isFirstMount ? 'bg-fd-primary' : 'bg-fd-muted-foreground/45'
            }`}
          />
          <span className="font-mono text-[10px] font-semibold tracking-wider text-fd-card-foreground uppercase">
            {isFirstMount ? 'initial mount' : 'subsequent render'}
          </span>
        </div>
        <span className="font-mono text-[10px] text-fd-muted-foreground tabular-nums">
          instance #{instanceId}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 font-mono text-xs tabular-nums">
        <div className="flex flex-col rounded border bg-fd-card/70 px-2.5 py-1.5">
          <span className="text-[9px] text-fd-muted-foreground uppercase">
            isFirstMount
          </span>
          <span className="font-semibold text-fd-card-foreground">
            {String(isFirstMount)}
          </span>
        </div>
        <div className="flex flex-col rounded border bg-fd-card/70 px-2.5 py-1.5">
          <span className="text-[9px] text-fd-muted-foreground uppercase">
            render pass
          </span>
          <span className="font-semibold text-fd-card-foreground">
            #{renderPass}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function UseFirstMountStateDemo() {
  const [instanceId, setInstanceId] = useState(1);
  const [renderPass, setRenderPass] = useState(1);

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

        <ProbeCard
          key={instanceId}
          instanceId={instanceId}
          renderPass={renderPass}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setRenderPass((r) => r + 1)}
            className="rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15 motion-reduce:transition-none"
          >
            Re-render
          </button>
          <button
            type="button"
            onClick={() => {
              setInstanceId((id) => id + 1);
              setRenderPass(1);
            }}
            className="rounded-lg border bg-fd-muted/40 px-2.5 py-1 text-[11px] font-medium text-fd-card-foreground transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted/70 motion-reduce:transition-none"
          >
            Remount
          </button>
        </div>

        <span className="font-mono text-[11px] text-fd-muted-foreground tabular-nums">
          pass: <strong className="text-fd-card-foreground">#{renderPass}</strong> · mount: <strong className="text-fd-card-foreground">#{instanceId}</strong>
        </span>
      </div>
    </div>
  );
}
