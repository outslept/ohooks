import { useObjectUrl } from '@/hooks/useObjectUrl';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe('useObjectUrl', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates blob URL for Blob source and revokes it on source change, null reset, and unmount', async () => {
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL');
    const blob1 = new Blob(['hello'], { type: 'text/plain' });
    const blob2 = new Blob(['world'], { type: 'text/plain' });

    const { result, rerender, unmount } = await renderHook(
      (props?: { source: Blob | null }) => useObjectUrl(props?.source ?? null),
      { initialProps: { source: null as Blob | null } }
    );

    expect(result.current).toBeNull();

    await rerender({ source: blob1 });
    const url1 = result.current;
    expect(url1).toMatch(/^blob:/);

    await rerender({ source: blob2 });
    const url2 = result.current;
    expect(url2).toMatch(/^blob:/);
    expect(url2).not.toBe(url1);
    expect(revokeSpy).toHaveBeenCalledWith(url1);

    await rerender({ source: null });
    expect(result.current).toBeNull();
    expect(revokeSpy).toHaveBeenCalledWith(url2);

    await rerender({ source: blob1 });
    const url3 = result.current;
    await unmount();
    expect(revokeSpy).toHaveBeenCalledWith(url3);
  });
});
