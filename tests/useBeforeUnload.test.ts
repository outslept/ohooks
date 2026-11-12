import { useBeforeUnload } from '@/hooks/useBeforeUnload';
import { describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useBeforeUnload', () => {
  it('cancels beforeunload event only when enabled boolean or predicate is true', async () => {
    let shouldBlock = true;
    const { rerender } = await renderHook(
      (enabled: boolean | (() => boolean) = () => shouldBlock) =>
        useBeforeUnload(enabled, 'Unsaved changes'),
    );

    const ev1 = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(ev1);
    expect(ev1.defaultPrevented).toBe(true);

    shouldBlock = false;
    const ev2 = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(ev2);
    expect(ev2.defaultPrevented).toBe(false);

    await rerender(false);
    const ev3 = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(ev3);
    expect(ev3.defaultPrevented).toBe(false);
  });
});
