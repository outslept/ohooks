import { useLatest } from '@/hooks/useLatest';
import { describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useLatest', () => {
  it('preserves ref identity and updates current value', async () => {
    const { result, rerender } = await renderHook((val = 1) => useLatest(val));
    const initialRef = result.current;
    expect(initialRef.current).toBe(1);

    await rerender(2);
    expect(result.current).toBe(initialRef);
    expect(result.current.current).toBe(2);
  });
});
