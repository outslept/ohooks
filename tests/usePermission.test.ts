import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';
import { usePermission } from '@/hooks/usePermission';

describe('usePermission', () => {
  const originalPermissions = Object.getOwnPropertyDescriptor(navigator, 'permissions');

  afterEach(() => {
    if (originalPermissions) {
      Object.defineProperty(navigator, 'permissions', originalPermissions);
    }
    vi.restoreAllMocks();
  });

  it('queries permission status and updates on change event', async () => {
    const statusTarget = Object.assign(new EventTarget(), {
      state: 'prompt' as PermissionState,
    });
    const query = vi.fn().mockResolvedValue(statusTarget);

    Object.defineProperty(navigator, 'permissions', {
      value: { query },
      configurable: true,
    });

    const { result, act } = await renderHook(() => usePermission('notifications'));

    await vi.waitFor(() => {
      expect(result.current).toBe('prompt');
    });

    await act(async () => {
      statusTarget.state = 'granted';
      statusTarget.dispatchEvent(new Event('change'));
    });

    expect(result.current).toBe('granted');
  });

  it('returns unsupported when navigator.permissions.query rejects', async () => {
    Object.defineProperty(navigator, 'permissions', {
      value: { query: vi.fn().mockRejectedValue(new TypeError('Unsupported')) },
      configurable: true,
    });

    const { result } = await renderHook(() => usePermission('camera'));

    await vi.waitFor(() => {
      expect(result.current).toBe('unsupported');
    });
  });
});
