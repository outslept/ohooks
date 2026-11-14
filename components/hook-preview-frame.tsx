"use client";

import * as React from "react";
import { cn } from "cn";

interface HookPreviewFrameProps extends React.ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode;
}

export function HookPreviewFrame({
  children,
  className,
  ...props
}: HookPreviewFrameProps) {
  const [key, _setKey] = React.useState(0);

  return (
    <div
      data-slot="hook-preview-frame"
      className={cn(
        "not-prose relative w-full rounded-xl border border-border-subtle bg-subtle/50 p-1",
        className
      )}
      {...props}
    >
      <div className="relative flex min-h-80 w-full items-center justify-center overflow-hidden rounded-lg border border-border-subtle/80 bg-background px-4 py-10 shadow-control md:px-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_20%,transparent_100%)] opacity-60"
        />

        <div
          key={key}
          className="relative z-1 flex w-full flex-col items-center justify-center"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
