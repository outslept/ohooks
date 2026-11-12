import { useEffect, useState } from 'react';

export type UseScriptStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface UseScriptOptions {
  shouldPreventLoad?: boolean;
  removeOnUnmount?: boolean;
  id?: string;
  async?: boolean;
  defer?: boolean;
  crossOrigin?: 'anonymous' | 'use-credentials' | '';
  nonce?: string;
  type?: string;
}

export function useScript(
  src: string | null,
  options: UseScriptOptions = {},
): UseScriptStatus {
  const {
    shouldPreventLoad = false,
    removeOnUnmount = false,
    id,
    async = true,
    defer,
    crossOrigin,
    nonce,
    type,
  } = options;

  const [status, setStatus] = useState<UseScriptStatus>(() => {
    if (!src || shouldPreventLoad) {
      return 'idle';
    }
    if (typeof document === 'undefined') {
      return 'loading';
    }
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${src}"]`,
    );
    const existingStatus = existing?.getAttribute(
      'data-status',
    ) as UseScriptStatus | null;
    return existingStatus ?? 'loading';
  });

  useEffect(() => {
    if (!src || shouldPreventLoad || typeof document === 'undefined') {
      setStatus('idle');
      return;
    }

    let script = document.querySelector<HTMLScriptElement>(
      `script[src="${src}"]`,
    );

    if (!script) {
      script = document.createElement('script');
      script.src = src;
      script.async = async;
      if (id !== undefined) script.id = id;
      if (defer !== undefined) script.defer = defer;
      if (crossOrigin !== undefined) script.crossOrigin = crossOrigin;
      if (nonce !== undefined) script.nonce = nonce;
      if (type !== undefined) script.type = type;
      script.setAttribute('data-status', 'loading');
      document.body.appendChild(script);
    } else {
      const currentStatus = script.getAttribute(
        'data-status',
      ) as UseScriptStatus | null;
      if (currentStatus) {
        setStatus(currentStatus);
      }
    }

    const handleScriptLoad = (): void => {
      script?.setAttribute('data-status', 'ready');
      setStatus('ready');
    };

    const handleScriptError = (): void => {
      script?.setAttribute('data-status', 'error');
      setStatus('error');
    };

    script.addEventListener('load', handleScriptLoad);
    script.addEventListener('error', handleScriptError);

    return () => {
      if (script) {
        script.removeEventListener('load', handleScriptLoad);
        script.removeEventListener('error', handleScriptError);

        if (removeOnUnmount) {
          script.remove();
        }
      }
    };
  }, [
    src,
    shouldPreventLoad,
    removeOnUnmount,
    id,
    async,
    defer,
    crossOrigin,
    nonce,
    type,
  ]);

  return status;
}
