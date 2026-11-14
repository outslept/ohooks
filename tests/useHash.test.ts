import { useHash } from '@/hooks/useHash';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useHash', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', window.location.pathname);
  });

  afterEach(() => {
    window.history.replaceState(null, '', window.location.pathname);
  });

  it('normalizes hashes, updates window.location.hash, and reacts to external hashchange', async () => {
    const { result, act } = await renderHook(() => useHash());
    expect(result.current[0]).toBe('');

    await act(async () => {
      result.current[1]('section-1');
    });
    expect(result.current[0]).toBe('#section-1');
    expect(window.location.hash).toBe('#section-1');

    await act(async () => {
      result.current[1]('#section-2', { replace: true });
    });
    expect(result.current[0]).toBe('#section-2');

    await act(async () => {
      result.current[1]('#');
    });
    expect(result.current[0]).toBe('');

    await act(async () => {
      window.location.hash = '#external';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(result.current[0]).toBe('#external');
  });
});
