import { describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';
import { useKeyPress } from '@/hooks/useKeyPress';

describe('useKeyPress', () => {
  it('tracks keydown/keyup for string, array, and predicate filters and resets on blur or modifier release', async () => {
    const { result, act } = await renderHook(() =>
      useKeyPress(['Enter', 'a'], { preventDefault: true })
    );

    expect(result.current).toBe(false);

    await act(async () => {
      const event = new KeyboardEvent('keydown', { key: 'A', cancelable: true });
      window.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    });
    expect(result.current).toBe(true);

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'a' }));
    });
    expect(result.current).toBe(false);

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    });
    expect(result.current).toBe(true);

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Meta' }));
    });
    expect(result.current).toBe(false);

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    });
    expect(result.current).toBe(true);

    await act(async () => {
      window.dispatchEvent(new Event('blur'));
    });
    expect(result.current).toBe(false);
  });

  it('supports custom predicate filter', async () => {
    const { result, act } = await renderHook(() =>
      useKeyPress((e) => e.shiftKey && e.key === 'Z')
    );

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Z', shiftKey: true }));
    });
    expect(result.current).toBe(true);
  });
});
