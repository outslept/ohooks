import { useElementRef } from '@/hooks/useElementRef';
import { describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useElementRef', () => {
  it('stores and updates element state via stable callback ref', async () => {
    const { result, rerender, act } = await renderHook(() =>
      useElementRef<HTMLDivElement>(),
    );

    const [initialRef, initialEl] = result.current;
    expect(initialEl).toBeNull();

    const div = document.createElement('div');
    await act(async () => {
      initialRef(div);
    });
    expect(result.current[1]).toBe(div);

    await rerender();
    expect(result.current[0]).toBe(initialRef);

    await act(async () => {
      initialRef(null);
    });
    expect(result.current[1]).toBeNull();
  });
});
