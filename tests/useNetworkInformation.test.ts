import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';
import { useNetworkInformation } from '@/hooks/useNetworkInformation';

describe('useNetworkInformation', () => {
  const originalConnection = Object.getOwnPropertyDescriptor(navigator, 'connection');

  afterEach(() => {
    if (originalConnection) {
      Object.defineProperty(navigator, 'connection', originalConnection);
    } else {
      delete (navigator as unknown as Record<string, unknown>).connection;
    }
    vi.restoreAllMocks();
  });

  it('reads navigator.connection metrics and updates on connection change and online/offline events', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);

    const mockConnection = Object.assign(new EventTarget(), {
      downlink: 10,
      downlinkMax: 100,
      effectiveType: '4g' as '4g' | '3g',
      rtt: 50,
      saveData: false,
      type: 'wifi' as 'wifi' | 'cellular',
    });

    Object.defineProperty(navigator, 'connection', {
      value: mockConnection,
      configurable: true,
    });

    const { result, act } = await renderHook(() => useNetworkInformation());

    expect(result.current.isSupported).toBe(true);
    expect(result.current.isOnline).toBe(true);
    expect(result.current.effectiveType).toBe('4g');
    expect(result.current.rtt).toBe(50);

    await act(async () => {
      mockConnection.effectiveType = '3g';
      mockConnection.rtt = 150;
      mockConnection.saveData = true;
      mockConnection.dispatchEvent(new Event('change'));
    });

    expect(result.current.effectiveType).toBe('3g');
    expect(result.current.rtt).toBe(150);
    expect(result.current.saveData).toBe(true);

    await act(async () => {
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current.isOnline).toBe(false);
  });
});
