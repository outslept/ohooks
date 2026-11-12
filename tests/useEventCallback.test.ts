import { useEventCallback } from '@/hooks/useEventCallback';
import { describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useEventCallback', () => {
  it('keeps stable function reference while calling latest closure', async () => {
    const { result, rerender } = await renderHook((factor: number = 2) =>
      useEventCallback((n: number) => n * factor),
    );
    const stableFn = result.current;
    expect(stableFn(4)).toBe(8);

    await rerender(5);
    expect(result.current).toBe(stableFn);
    expect(stableFn(4)).toBe(20);
  });
});
