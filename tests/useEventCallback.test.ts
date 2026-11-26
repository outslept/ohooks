import { useEventCallback } from '@/hooks/useEventCallback';
import { describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useEventCallback', () => {
  it('maintains a stable function reference while invoking the latest closure with all arguments', async () => {
    const { result, rerender } = await renderHook(
      (props?: { prefix: string; multiplier: number }) => {
        const prefix = props?.prefix ?? 'v1';
        const multiplier = props?.multiplier ?? 2;
        return useEventCallback(
          (a: number, b: number) => `${prefix}:${(a + b) * multiplier}`,
        );
      },
      { initialProps: { prefix: 'v1', multiplier: 2 } },
    );

    const stableFn = result.current;
    expect(stableFn(3, 4)).toBe('v1:14');

    await rerender({ prefix: 'v2', multiplier: 10 });
    expect(result.current).toBe(stableFn);
    expect(stableFn(3, 4)).toBe('v2:70');
  });
});
