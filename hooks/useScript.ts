import { useEffect, useState } from 'react';

/** Loading status of an external `<script>` tag. */
export type ScriptStatus = 'idle' | 'loading' | 'ready' | 'error';

/** Configuration options for `useScript`. */
export interface UseScriptOptions {
  /** Prevent the script from loading while `true` (default: `false`). */
  shouldPreventLoad?: boolean;
  /** Remove the `<script>` element when the last consumer unmounts (default: `false`). */
  removeOnUnmount?: boolean;
  /** Optional `id` attribute for the `<script>` tag. */
  id?: string;
  /** Set the `async` attribute on the `<script>` tag (default: `true`). */
  async?: boolean;
  /** Set the `defer` attribute on the `<script>` tag (default: `false`). */
  defer?: boolean;
  /** CORS setting for the `<script>` element. */
  crossOrigin?: 'anonymous' | 'use-credentials' | '';
  /** Subresource Integrity (`integrity`) hash. */
  integrity?: string;
  /** Script `type` attribute (e.g. `'module'`). */
  type?: string;
  /** Set the `noModule` attribute on the `<script>` tag. */
  noModule?: boolean;
  /** Referrer policy for fetching the script. */
  referrerPolicy?: ReferrerPolicy;
}

const scriptConsumerCounts = new Map<string, number>();
const scriptStatusCache = new Map<string, ScriptStatus>();

function findExistingScript(src: string): HTMLScriptElement | null {
  if (typeof document === 'undefined') {
    return null;
  }
  const scripts = document.getElementsByTagName('script');
  for (let i = 0; i < scripts.length; i += 1) {
    const script = scripts[i];
    if (
      script &&
      (script.getAttribute('src') === src || script.src === src)
    ) {
      return script;
    }
  }
  return null;
}

/**
 * Dynamically loads an external `<script>` tag, deduplicating across components and tracking its status.
 *
 * @category DOM
 * @param src - Script URL to load, or `null` to stay `'idle'`
 * @param options - Script attributes and lifecycle options
 * @returns Current loading status (`'idle' | 'loading' | 'ready' | 'error'`)
 *
 * @example
 * ```tsx
 * const status = useScript('https://js.stripe.com/v3/');
 * ```
 */
export function useScript(
  src: string | null,
  options: UseScriptOptions = {}
): ScriptStatus {
  const {
    shouldPreventLoad = false,
    removeOnUnmount = false,
    id,
    async = true,
    defer = false,
    crossOrigin,
    integrity,
    type,
    noModule,
    referrerPolicy,
  } = options;

  const [status, setStatus] = useState<ScriptStatus>(() => {
    if (!src || shouldPreventLoad) {
      return 'idle';
    }
    if (typeof document === 'undefined') {
      return 'loading';
    }
    const cached = scriptStatusCache.get(src);
    if (cached) {
      return cached;
    }
    const existing = findExistingScript(src);
    if (existing) {
      const attrStatus = existing.getAttribute(
        'data-status'
      ) as ScriptStatus | null;
      return attrStatus ?? 'ready';
    }
    return 'loading';
  });

  useEffect(() => {
    if (!src || shouldPreventLoad || typeof document === 'undefined') {
      setStatus('idle');
      return;
    }

    const prevCount = scriptConsumerCounts.get(src) ?? 0;
    scriptConsumerCounts.set(src, prevCount + 1);

    let script = findExistingScript(src);

    if (!script) {
      script = document.createElement('script');
      script.src = src;
      script.async = async;
      script.defer = defer;
      if (id !== undefined) script.id = id;
      if (crossOrigin !== undefined) script.crossOrigin = crossOrigin;
      if (integrity !== undefined) script.integrity = integrity;
      if (type !== undefined) script.type = type;
      if (noModule !== undefined) script.noModule = noModule;
      if (referrerPolicy !== undefined) script.referrerPolicy = referrerPolicy;

      script.setAttribute('data-status', 'loading');
      scriptStatusCache.set(src, 'loading');
      document.body.appendChild(script);
    } else {
      const existingAttrStatus = script.getAttribute(
        'data-status'
      ) as ScriptStatus | null;
      const resolvedStatus =
        existingAttrStatus ?? scriptStatusCache.get(src) ?? 'ready';
      script.setAttribute('data-status', resolvedStatus);
      scriptStatusCache.set(src, resolvedStatus);
      setStatus(resolvedStatus);
    }

    const handleScriptLoad = () => {
      script?.setAttribute('data-status', 'ready');
      scriptStatusCache.set(src, 'ready');
      setStatus('ready');
    };

    const handleScriptError = () => {
      script?.setAttribute('data-status', 'error');
      scriptStatusCache.set(src, 'error');
      setStatus('error');
    };

    script.addEventListener('load', handleScriptLoad);
    script.addEventListener('error', handleScriptError);

    return () => {
      if (script) {
        script.removeEventListener('load', handleScriptLoad);
        script.removeEventListener('error', handleScriptError);
      }

      const remaining = (scriptConsumerCounts.get(src) ?? 1) - 1;
      if (remaining <= 0) {
        scriptConsumerCounts.delete(src);
        if (removeOnUnmount && script) {
          script.remove();
          scriptStatusCache.delete(src);
        }
      } else {
        scriptConsumerCounts.set(src, remaining);
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
    integrity,
    type,
    noModule,
    referrerPolicy,
  ]);

  return status;
}

export default useScript;
