import { useEffect, useRef, useState } from 'react';
import { useEventCallback } from './useEventCallback';
import { useLatest } from './useLatest';

export interface UseBroadcastChannelOptions<T> {
  enabled?: boolean;
  onMessage?: (event: MessageEvent<T>) => void;
  onMessageError?: (event: MessageEvent) => void;
}

export interface UseBroadcastChannelReturn<T> {
  isSupported: boolean;
  lastMessage: T | undefined;
  error: Event | null;
  postMessage: (message: T) => boolean;
}

function isBroadcastChannelSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.BroadcastChannel === 'function'
  );
}

export function useBroadcastChannel<T = unknown>(
  channelName: string,
  options: UseBroadcastChannelOptions<T> = {},
): UseBroadcastChannelReturn<T> {
  const { enabled = true, onMessage, onMessageError } = options;

  const [lastMessage, setLastMessage] = useState<T | undefined>(undefined);
  const [error, setError] = useState<Event | null>(null);

  const channelRef = useRef<BroadcastChannel | null>(null);
  const onMessageRef = useLatest(onMessage);
  const onMessageErrorRef = useLatest(onMessageError);

  useEffect(() => {
    if (!enabled || !channelName || !isBroadcastChannelSupported()) {
      return;
    }

    const channel = new BroadcastChannel(channelName);
    channelRef.current = channel;

    const handleMessage = (event: MessageEvent<T>): void => {
      setLastMessage(event.data);
      setError(null);
      onMessageRef.current?.(event);
    };

    const handleMessageError = (event: MessageEvent): void => {
      setError(event);
      onMessageErrorRef.current?.(event);
    };

    channel.addEventListener('message', handleMessage);
    channel.addEventListener('messageerror', handleMessageError);

    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.removeEventListener('messageerror', handleMessageError);
      channel.close();
      channelRef.current = null;
    };
  }, [channelName, enabled, onMessageRef, onMessageErrorRef]);

  const postMessage = useEventCallback((message: T): boolean => {
    if (!channelRef.current) {
      return false;
    }

    try {
      channelRef.current.postMessage(message);
      return true;
    } catch {
      return false;
    }
  });

  return {
    isSupported: isBroadcastChannelSupported(),
    lastMessage,
    error,
    postMessage,
  };
}
