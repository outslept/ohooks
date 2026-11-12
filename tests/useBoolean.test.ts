import { useBoolean } from '@/hooks/useBoolean';
import { act } from 'react';
import { describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useBoolean', () => {
  it('defaults to false and supports setTrue, setFalse, toggle, and setValue', async () => {
    const { result } = await renderHook(() => useBoolean());
    expect(result.current.value).toBe(false);

    act(() => result.current.setTrue());
    expect(result.current.value).toBe(true);

    act(() => result.current.setFalse());
    expect(result.current.value).toBe(false);

    act(() => result.current.toggle());
    expect(result.current.value).toBe(true);

    act(() => result.current.setValue((prev) => !prev));
    expect(result.current.value).toBe(false);
  });

  it('respects custom initial value', async () => {
    const { result } = await renderHook(() => useBoolean(true));
    expect(result.current.value).toBe(true);
  });
});
