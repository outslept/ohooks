import { useScript, type UseScriptOptions } from '@/hooks/useScript';
import { describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe('useScript', () => {
  it('loads script with custom attributes, deduplicates across consumers, and removes on last unmount', async () => {
    const blob = new Blob(['window.__scriptTestRan = true;'], {
      type: 'text/javascript',
    });
    const blobUrl = URL.createObjectURL(blob);

    const { result: consumer1, unmount: unmount1 } = await renderHook(() =>
      useScript(blobUrl, {
        id: 'test-blob-script',
        defer: true,
        async: false,
        crossOrigin: 'anonymous',
        referrerPolicy: 'no-referrer',
        removeOnUnmount: true,
      })
    );

    await expect.poll(() => consumer1.current).toBe('ready');

    const scriptEl = document.getElementById(
      'test-blob-script'
    ) as HTMLScriptElement | null;
    expect(scriptEl).not.toBeNull();
    expect(scriptEl?.defer).toBe(true);
    expect(scriptEl?.async).toBe(false);
    expect(scriptEl?.crossOrigin).toBe('anonymous');
    expect(scriptEl?.referrerPolicy).toBe('no-referrer');

    const { result: consumer2, unmount: unmount2 } = await renderHook(() =>
      useScript(blobUrl, { removeOnUnmount: true })
    );
    expect(consumer2.current).toBe('ready');

    await unmount1();
    expect(document.getElementById('test-blob-script')).not.toBeNull();

    await unmount2();
    expect(document.getElementById('test-blob-script')).toBeNull();

    URL.revokeObjectURL(blobUrl);
  });

  it('transitions from idle when shouldPreventLoad changes and reports error on load failure', async () => {
    const { result, rerender, unmount } = await renderHook(
      (props?: UseScriptOptions & { src: string | null }) =>
        useScript(props ? props.src : null, {
          removeOnUnmount: true,
          ...props,
        }),
      { initialProps: { src: 'blob:invalid-script-url', shouldPreventLoad: true } }
    );

    expect(result.current).toBe('idle');

    await rerender({ src: 'blob:invalid-script-url', shouldPreventLoad: false });
    await expect.poll(() => result.current).toBe('error');

    await unmount();
  });
});
