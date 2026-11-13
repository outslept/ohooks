import { useEffect, useLayoutEffect } from "react";

/**
 * Uses `useLayoutEffect` in browser environments and falls back to `useEffect` during server-side rendering to avoid React SSR warnings.
 *
 * @category Effects
 *
 * @example
 * ```tsx
 * useIsomorphicLayoutEffect(() => {
 *   measureNode();
 * }, []);
 * ```
 */
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
