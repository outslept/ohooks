import { useState } from "react";
import { useBoolean } from "./useBoolean";
import { useEventCallback } from "./useEventCallback";
import { useTimeout } from "./useTimeout";

export interface UseCopyToClipboardOptions {
  /** Time in milliseconds before `isCopied` resets to `false`, or `null` to disable auto-reset (default: `2000`) */
  resetInterval?: number | null;
}

export interface UseCopyToClipboardReturn {
  /** Last text successfully copied to the clipboard, or `null` */
  copiedText: string | null;
  /** Whether text was recently copied (resets after `resetInterval`) */
  isCopied: boolean;
  /** Writes the given string to the system clipboard */
  copy: (text: string) => Promise<boolean>;
  /** Clears `copiedText` and resets `isCopied` to `false` */
  reset: () => void;
}

/**
 * Copies text to the system clipboard and tracks the copied state with an optional auto-reset timer.
 *
 * @category Browser
 * @param options - Configuration for automatic `isCopied` state reset
 * @returns Clipboard state (`copiedText`, `isCopied`) and actions (`copy`, `reset`)
 *
 * @example
 * ```tsx
 * const { isCopied, copy } = useCopyToClipboard({ resetInterval: 2000 });
 * ```
 */
export function useCopyToClipboard(
  options: UseCopyToClipboardOptions = {},
): UseCopyToClipboardReturn {
  const { resetInterval = 2000 } = options;

  const [copiedText, setCopiedText] = useState<string | null>(null);
  const { value: isCopied, setTrue, setFalse } = useBoolean(false);

  const reset = useEventCallback(() => {
    setFalse();
    setCopiedText(null);
  });

  const copy = useEventCallback(async (text: string): Promise<boolean> => {
    if (
      typeof navigator === "undefined" ||
      !navigator.clipboard ||
      typeof navigator.clipboard.writeText !== "function"
    ) {
      setFalse();
      setCopiedText(null);
      return false;
    }

    setFalse();

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTrue();
      return true;
    } catch {
      setFalse();
      setCopiedText(null);
      return false;
    }
  });

  useTimeout(
    setFalse,
    isCopied && resetInterval !== null && resetInterval > 0 ? resetInterval : null,
  );

  return { copiedText, isCopied, copy, reset };
}
