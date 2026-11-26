import { usePrevious } from '@/hooks/usePrevious';
import { describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe('usePrevious', () => {
  it('returns undefined on mount and previous render value on subsequent renders', async () => {
    const { result, rerender } = await renderHook(
      (props?: { val: string }) => usePrevious(props?.val ?? 'a'),
      { initialProps: { val: 'a' } }
    );

    expect(result.current).toBeUndefined();

    await rerender({ val: 'b' });
    expect(result.current).toBe('a');

    await rerender({ val: 'b' });
    expect(result.current).toBe('b');
  });
});
