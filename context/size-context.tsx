"use client";

import * as React from "react";

export type SizeStep = "default" | "compact";
export type Size = SizeStep;

export const SIZE_TOKENS = {
  default: {
    control: "h-9", // 36px
    segmentPad: "p-1", // 4px
    segmentItem: "h-7", // 28px (28px + 4px*2 = 36px)
    text: "text-ui", // 13px / 20px
    field: "text-base pointer-hover:text-ui", // 16px on touch, 13px/20px on desktop
    icon: "size-4", // 16px
    px: "px-3", // 12px
    itemPx: "px-2", // 8px
    gap: "gap-2", // 8px
  },
  compact: {
    control: "h-7", // 28px
    segmentPad: "p-0.5", // 2px
    segmentItem: "h-6", // 24px (24px + 2px*2 = 28px)
    text: "text-xs", // 12px / 18px
    field: "text-base pointer-hover:text-xs", // 16px on touch, 12px/18px on desktop
    icon: "size-3.5", // 14px
    px: "px-2.5", // 10px
    itemPx: "px-1.5", // 6px
    gap: "gap-1", // 4px
  },
} as const;

export const TYPE_SCALE_TOKENS = {
  default: {
    caption: "text-xs/4", // 12px / 16px
    body: "text-ui", // 13px / 20px
    subhead: "text-sm/5 font-medium", // 14px / 20px
    title: "text-base/6 font-semibold", // 16px / 24px
    heading: "text-xl/7 font-semibold tracking-tight", // 20px / 28px
    display: "text-[28px]/[34px] font-semibold tracking-tight",
  },
  compact: {
    caption: "text-2xs/[14px]", // 11px / 14px
    body: "text-xs", // 12px / 18px
    subhead: "text-ui/[18px] font-medium", // 13px / 18px
    title: "text-sm/5 font-semibold", // 14px / 20px
    heading: "text-base/6 font-semibold tracking-tight", // 16px / 24px
    display: "text-[22px]/[28px] font-semibold tracking-tight",
  },
} as const;

interface SizeContextValue {
  size: SizeStep;
  setSize: React.Dispatch<React.SetStateAction<SizeStep>>;
  tokens: (typeof SIZE_TOKENS)[SizeStep];
}

const SizeContext = React.createContext<SizeContextValue | null>(null);

export interface SizeProviderProps {
  size?: SizeStep;
  defaultSize?: SizeStep;
  children: React.ReactNode;
}

export function SizeProvider({
  size: controlledSize,
  defaultSize = "default",
  children,
}: SizeProviderProps) {
  const [uncontrolledSize, setUncontrolledSize] =
    React.useState<SizeStep>(defaultSize);

  const resolvedSize = controlledSize ?? uncontrolledSize;

  const setSize = React.useCallback<
    React.Dispatch<React.SetStateAction<SizeStep>>
  >(
    (updater) => {
      if (controlledSize === undefined) {
        setUncontrolledSize(updater);
      }
    },
    [controlledSize]
  );

  const value = React.useMemo<SizeContextValue>(
    () => ({
      size: resolvedSize,
      setSize,
      tokens: SIZE_TOKENS[resolvedSize],
    }),
    [resolvedSize, setSize]
  );

  return <SizeContext.Provider value={value}>{children}</SizeContext.Provider>;
}

export function useSizeContext(): SizeContextValue {
  const ctx = React.useContext(SizeContext);
  if (!ctx) {
    return {
      size: "default",
      setSize: () => {},
      tokens: SIZE_TOKENS.default,
    };
  }
  return ctx;
}

export function useSize(override?: SizeStep) {
  const { size: contextSize } = useSizeContext();
  const resolved = override ?? contextSize;
  return {
    size: resolved,
    tokens: SIZE_TOKENS[resolved],
  };
}

export function useTypeScale(override?: SizeStep) {
  const { size } = useSize(override);
  return TYPE_SCALE_TOKENS[size];
}
