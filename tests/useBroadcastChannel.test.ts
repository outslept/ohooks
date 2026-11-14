import { useBroadcastChannel } from '@/hooks/useBroadcastChannel';
import { describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useBroadcastChannel', () => {
  it('delivers messages between channel instances and respects enabled option', async () => {
    const onMessage = vi.fn();
    const { result: sender, act } = await renderHook(() =>
      useBroadcastChannel<{ text: string }>('test-bc-channel'),
    );
    const { result: receiver } = await renderHook(() =>
      useBroadcastChannel<{ text: string }>('test-bc-channel', { onMessage }),
    );
    const { result: disabled } = await renderHook(() =>
      useBroadcastChannel<string>('test-bc-channel', { enabled: false }),
    );

    expect(sender.current.isSupported).toBe(true);
    expect(disabled.current.postMessage('ignored')).toBe(false);

    await act(async () => {
      const sent = sender.current.postMessage({ text: 'ping' });
      expect(sent).toBe(true);
    });

    await vi.waitFor(() => {
      expect(receiver.current.lastMessage).toEqual({ text: 'ping' });
    });
    expect(onMessage).toHaveBeenCalledOnce();
  });
});
