import { useEffect, useRef, useState } from 'react';
import { useEventCallback } from './useEventCallback';
import { useLatest } from './useLatest';

export interface UseBroadcastChannelOptions<T> {
  /** Whether the broadcast channel subscription is active (default: `true`) */
  enabled?: boolean;
  /** Callback fired when a message is received on the channel */
  onMessage?: (event: MessageEvent<T>) => void;
  /** Callback fired when a message cannot be deserialized */
  onMessageError?: (event: MessageEvent) => void;
}

export interface UseBroadcastChannelReturn<T> {
  /** Whether the `BroadcastChannel` API is supported in the current environment */
  isSupported: boolean;
  /** Most recent message data received from the channel */
  lastMessage: T | undefined;
  /** Latest message deserialization error event, or `null` */
  error: Event | null;
  /** Sends a message to all browsing contexts listening on the channel */
  postMessage: (message: T) => boolean;
}

function isBroadcastChannelSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.BroadcastChannel === 'function'
  );
}

/**
 * Communicates between browser tabs, windows, or iframes of the same origin using the `BroadcastChannel` API.
 *
 * @category Browser
 * @param channelName - Name of the broadcast channel to join
 * @param options - Configuration options and message event callbacks
 * @returns Channel support flag, latest received message, error state, and `postMessage` sender
 *
 * @example
 * ```tsx
 * const { lastMessage, postMessage } = useBroadcastChannel<string>('auth-channel');
 * ```
 */
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
