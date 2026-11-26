import { useFirstMountState } from '@/hooks/useFirstMountState';
import { describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useFirstMountState', () => {
  it('returns true only on initial mount and false on all subsequent rerenders', async () => {
    const { result, rerender } = await renderHook(() => useFirstMountState());

    expect(result.current).toBe(true);

    await rerender();
    expect(result.current).toBe(false);

    await rerender();
    expect(result.current).toBe(false);
  });
});
