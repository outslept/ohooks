import { useObjectUrl } from '@/hooks/useObjectUrl';
import { describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useObjectUrl', () => {
  it('creates blob URL for Blob source and revokes it on change and unmount', async () => {
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL');
    const blob1 = new Blob(['hello'], { type: 'text/plain' });
    const blob2 = new Blob(['world'], { type: 'text/plain' });

    const { result, rerender, unmount } = await renderHook(
      (source: Blob | null = null) => useObjectUrl(source),
    );
    expect(result.current).toBeNull();

    await rerender(blob1);
    const url1 = result.current;
    expect(url1).toMatch(/^blob:/);

    await rerender(blob2);
    const url2 = result.current;
    expect(url2).toMatch(/^blob:/);
    expect(url2).not.toBe(url1);
    expect(revokeSpy).toHaveBeenCalledWith(url1);

    await unmount();
    expect(revokeSpy).toHaveBeenCalledWith(url2);
    revokeSpy.mockRestore();
  });
});
