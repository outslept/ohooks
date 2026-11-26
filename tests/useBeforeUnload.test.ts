import { useBeforeUnload } from '@/hooks/useBeforeUnload';
import { describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';

function dispatchBeforeUnload(): {
  event: Event;
  assignedReturnValue: unknown;
} {
  let assignedReturnValue: unknown;
  const event = new Event('beforeunload', { cancelable: true });
  Object.defineProperty(event, 'returnValue', {
    configurable: true,
    get: () => assignedReturnValue,
    set: (val: unknown) => {
      assignedReturnValue = val;
    },
  });
  window.dispatchEvent(event);
  return { event, assignedReturnValue };
}

describe('useBeforeUnload', () => {
  it('blocks beforeunload by default with an empty returnValue and removes listener on unmount', async () => {
    const { unmount } = await renderHook(() => useBeforeUnload());

    const first = dispatchBeforeUnload();
    expect(first.event.defaultPrevented).toBe(true);
    expect(first.assignedReturnValue).toBe('');

    await unmount();

    const afterUnmount = dispatchBeforeUnload();
    expect(afterUnmount.event.defaultPrevented).toBe(false);
    expect(afterUnmount.assignedReturnValue).toBeUndefined();
  });

  it('attaches and detaches listener when boolean enabled toggles and assigns custom message', async () => {
    const { rerender } = await renderHook(
      (props?: { enabled?: boolean; message?: string }) =>
        useBeforeUnload(props?.enabled, props?.message),
      { initialProps: { enabled: false, message: 'Unsaved changes' } },
    );

    const whenDisabled = dispatchBeforeUnload();
    expect(whenDisabled.event.defaultPrevented).toBe(false);
    expect(whenDisabled.assignedReturnValue).toBeUndefined();

    await rerender({ enabled: true, message: 'Unsaved changes' });

    const whenEnabled = dispatchBeforeUnload();
    expect(whenEnabled.event.defaultPrevented).toBe(true);
    expect(whenEnabled.assignedReturnValue).toBe('Unsaved changes');

    await rerender({ enabled: false, message: 'Unsaved changes' });

    const whenDisabledAgain = dispatchBeforeUnload();
    expect(whenDisabledAgain.event.defaultPrevented).toBe(false);
  });

  it('evaluates predicate function dynamically on each beforeunload event', async () => {
    let shouldBlock = false;
    await renderHook(() => useBeforeUnload(() => shouldBlock, 'Dirty form'));

    const allowed = dispatchBeforeUnload();
    expect(allowed.event.defaultPrevented).toBe(false);
    expect(allowed.assignedReturnValue).toBeUndefined();

    shouldBlock = true;

    const blocked = dispatchBeforeUnload();
    expect(blocked.event.defaultPrevented).toBe(true);
    expect(blocked.assignedReturnValue).toBe('Dirty form');
  });
});
