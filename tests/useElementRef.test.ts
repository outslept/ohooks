import { useElementRef } from '@/hooks/useElementRef';
import { act } from 'react';
import { describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useElementRef', () => {
  it('stores and updates element state via stable callback ref', async () => {
    const { result, rerender } = await renderHook(() =>
      useElementRef<HTMLDivElement>(),
    );
    const [initialRef, initialEl] = result.current;
    expect(initialEl).toBeNull();

    const div = document.createElement('div');
    act(() => initialRef(div));
    expect(result.current[1]).toBe(div);

    await rerender();
    expect(result.current[0]).toBe(initialRef);

    act(() => initialRef(null));
    expect(result.current[1]).toBeNull();
  });
});
