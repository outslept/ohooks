import {
  usePermission,
  type ExtendedPermissionDescriptor,
  type ExtendedPermissionName,
} from '@/hooks/usePermission';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe('usePermission', () => {
  const originalPermissions = Object.getOwnPropertyDescriptor(
    navigator,
    'permissions'
  );

  afterEach(() => {
    if (originalPermissions) {
      Object.defineProperty(navigator, 'permissions', originalPermissions);
    }
    vi.restoreAllMocks();
  });

  it('queries real PermissionStatus, reacts to change events, resets on descriptor change, and cleans up on unmount', async () => {
    const querySpy = vi.spyOn(navigator.permissions, 'query');

    const { result, rerender, act, unmount } = await renderHook(
      (
        props?: {
          perm: ExtendedPermissionName | ExtendedPermissionDescriptor;
        }
      ) => usePermission(props?.perm ?? 'notifications'),
      {
        initialProps: {
          perm: 'notifications' as
            | ExtendedPermissionName
            | ExtendedPermissionDescriptor,
        },
      }
    );

    await expect
      .poll(() => result.current)
      .toSatisfy((s) => s === 'prompt' || s === 'denied' || s === 'granted');

    const status = (await querySpy.mock.results[0]?.value) as PermissionStatus;
    const removeListenerSpy = vi.spyOn(status, 'removeEventListener');

    await act(async () => {
      Object.defineProperty(status, 'state', {
        value: 'granted',
        configurable: true,
      });
      status.dispatchEvent(new Event('change'));
    });
    expect(result.current).toBe('granted');


    await rerender({
      perm: { name: 'invalid-permission-name' as ExtendedPermissionName },
    });
    await expect.poll(() => result.current).toBe('unsupported');
    expect(removeListenerSpy).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );

    await unmount();
  });

  it('returns unsupported immediately when navigator.permissions is unavailable', async () => {
    Object.defineProperty(navigator, 'permissions', {
      value: undefined,
      configurable: true,
    });

    const { result } = await renderHook(() => usePermission('camera'));
    expect(result.current).toBe('unsupported');
  });
});
