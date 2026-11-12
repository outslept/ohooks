import { useState } from 'react';
import { useBoolean } from './useBoolean';
import { useEventCallback } from './useEventCallback';
import { useTimeout } from './useTimeout';

export interface UseCopyToClipboardOptions {
  resetInterval?: number | null;
}

export interface UseCopyToClipboardReturn {
  copiedText: string | null;
  isCopied: boolean;
  copy: (text: string) => Promise<boolean>;
  reset: () => void;
}

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
      typeof navigator === 'undefined' ||
      !navigator.clipboard ||
      typeof navigator.clipboard.writeText !== 'function'
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
    isCopied && resetInterval !== null && resetInterval > 0
      ? resetInterval
      : null,
  );

  return { copiedText, isCopied, copy, reset };
}
