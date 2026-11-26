import { useElementRef } from '@/hooks/useElementRef';
import { describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useElementRef', () => {
  it('tracks attached, replaced, and detached DOM elements while keeping a stable callback ref', async () => {
    const { result, rerender, act } = await renderHook(() =>
      useElementRef<HTMLDivElement>(),
    );

    const [initialRef, initialEl] = result.current;
    expect(initialEl).toBeNull();

    const firstDiv = document.createElement('div');
    const secondDiv = document.createElement('div');

    await act(async () => {
      initialRef(firstDiv);
    });
    expect(result.current[1]).toBe(firstDiv);

    await act(async () => {
      initialRef(secondDiv);
    });
    expect(result.current[1]).toBe(secondDiv);

    await rerender();
    expect(result.current[0]).toBe(initialRef);

    await act(async () => {
      initialRef(null);
    });
    expect(result.current[1]).toBeNull();
  });
});
