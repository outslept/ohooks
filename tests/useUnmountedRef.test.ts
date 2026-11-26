import { useUnmountedRef } from '@/hooks/useUnmountedRef';
import { describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe('useUnmountedRef', () => {
  it('is false while mounted and true after unmount', async () => {
    const { result, rerender, unmount } = await renderHook(() =>
      useUnmountedRef(),
    );

    expect(result.current.current).toBe(false);
    await rerender();
    expect(result.current.current).toBe(false);

    await unmount();
    expect(result.current.current).toBe(true);
  });
});
