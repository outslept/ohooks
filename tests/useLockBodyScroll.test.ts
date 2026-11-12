import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { beforeEach, describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useLockBodyScroll', () => {
  beforeEach(() => {
    document.body.style.overflow = 'auto';
  });

  it('locks body overflow with reference counting across multiple instances and restores on unlock', async () => {
    const { unmount: unmount1 } = await renderHook(() =>
      useLockBodyScroll(true),
    );
    const { unmount: unmount2 } = await renderHook(() =>
      useLockBodyScroll(true),
    );

    expect(document.body.style.overflow).toBe('hidden');

    await unmount1();
    expect(document.body.style.overflow).toBe('hidden');

    await unmount2();
    expect(document.body.style.overflow).toBe('auto');
  });
});
