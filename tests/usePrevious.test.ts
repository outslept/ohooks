import { usePrevious } from '@/hooks/usePrevious';
import { describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('usePrevious', () => {
  it('returns undefined on mount and previous render value on updates', async () => {
    const { result, rerender } = await renderHook((val = 'a') =>
      usePrevious(val),
    );
    expect(result.current).toBeUndefined();

    await rerender('b');
    expect(result.current).toBe('a');

    await rerender('b');
    expect(result.current).toBe('b');
  });
});
