import { useScript } from '@/hooks/useScript';
import { describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useScript', () => {
  it('loads valid script to ready state, shares status across consumers, and removes on unmount', async () => {
    const blob = new Blob(['window.__scriptTestRan = true;'], {
      type: 'text/javascript',
    });
    const blobUrl = URL.createObjectURL(blob);

    const { result: consumer1, unmount: unmount1 } = await renderHook(() =>
      useScript(blobUrl, { id: 'test-blob-script', removeOnUnmount: true }),
    );

    await vi.waitFor(() => {
      expect(consumer1.current).toBe('ready');
    });

    const { result: consumer2, unmount: unmount2 } = await renderHook(() =>
      useScript(blobUrl, { removeOnUnmount: true }),
    );
    expect(consumer2.current).toBe('ready');
    expect(document.getElementById('test-blob-script')).not.toBeNull();

    await unmount1();
    expect(document.getElementById('test-blob-script')).not.toBeNull();

    await unmount2();
    expect(document.getElementById('test-blob-script')).toBeNull();
    URL.revokeObjectURL(blobUrl);
  });

  it('handles idle state and error status on failed load', async () => {
    const { result: idleHook } = await renderHook(() =>
      useScript(null, { shouldPreventLoad: true }),
    );
    expect(idleHook.current).toBe('idle');

    const { result: errHook, unmount } = await renderHook(() =>
      useScript('http://localhost:1/non-existent-script.js', {
        removeOnUnmount: true,
      }),
    );

    await vi.waitFor(() => {
      expect(errHook.current).toBe('error');
    });
    await unmount();
  });
});
