import { useBroadcastChannel, type UseBroadcastChannelOptions } from "@/hooks/useBroadcastChannel";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "vitest-browser-react";

describe("useBroadcastChannel", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("delivers messages between hooks on the same channel and updates lastMessage", async () => {
    let resolveMessage!: (event: MessageEvent<{ text: string }>) => void;
    const messageReceived = new Promise<MessageEvent<{ text: string }>>((resolve) => {
      resolveMessage = resolve;
    });
    const onMessage = vi.fn((event: MessageEvent<{ text: string }>) => {
      resolveMessage(event);
    });

    const { result: sender } = await renderHook(() =>
      useBroadcastChannel<{ text: string }>("bc-core-delivery"),
    );
    const { result: receiver, act: receiverAct } = await renderHook(() =>
      useBroadcastChannel<{ text: string }>("bc-core-delivery", { onMessage }),
    );

    expect(sender.current.isSupported).toBe(true);
    expect(receiver.current.lastMessage).toBeUndefined();
    expect(receiver.current.error).toBeNull();

    await receiverAct(async () => {
      const sent = sender.current.postMessage({ text: "ping" });
      expect(sent).toBe(true);
      await messageReceived;
    });

    expect(receiver.current.lastMessage).toEqual({ text: "ping" });
    expect(onMessage).toHaveBeenCalledOnce();
    expect(onMessage.mock.calls[0]?.[0]?.data).toEqual({ text: "ping" });
  });

  it("does not open a channel when disabled or when channelName is empty, and reconnects when enabled", async () => {
    const closeSpy = vi.spyOn(BroadcastChannel.prototype, "close");

    const { result: emptyName } = await renderHook(() => useBroadcastChannel<string>(""));
    expect(emptyName.current.postMessage("noop")).toBe(false);

    const { result, rerender } = await renderHook(
      (props?: UseBroadcastChannelOptions<string>) =>
        useBroadcastChannel<string>("bc-core-toggle", props),
      { initialProps: { enabled: false } },
    );

    expect(result.current.postMessage("while-disabled")).toBe(false);

    await rerender({ enabled: true });
    expect(result.current.postMessage("while-enabled")).toBe(true);

    await rerender({ enabled: false });
    expect(closeSpy).toHaveBeenCalledOnce();
    expect(result.current.postMessage("after-disable")).toBe(false);
  });

  it("returns false instead of throwing when postMessage fails to clone the payload", async () => {
    const { result } = await renderHook(() => useBroadcastChannel<unknown>("bc-core-clone-error"));

    const sent = result.current.postMessage(() => {});
    expect(sent).toBe(false);
  });

  it("captures messageerror events into error state and clears error on the next valid message", async () => {
    const addListenerSpy = vi.spyOn(BroadcastChannel.prototype, "addEventListener");
    const onMessageError = vi.fn();

    let resolveNextMessage!: () => void;
    const nextMessageReceived = new Promise<void>((resolve) => {
      resolveNextMessage = resolve;
    });

    const { result: receiver, act } = await renderHook(() =>
      useBroadcastChannel<string>("bc-core-error", {
        onMessageError,
        onMessage: () => resolveNextMessage(),
      }),
    );
    const { result: sender } = await renderHook(() => useBroadcastChannel<string>("bc-core-error"));

    const channelInstance = addListenerSpy.mock.instances[0] as BroadcastChannel;
    const errorEvent = new MessageEvent("messageerror");

    await act(async () => {
      channelInstance.dispatchEvent(errorEvent);
    });

    expect(receiver.current.error).toBe(errorEvent);
    expect(onMessageError).toHaveBeenCalledExactlyOnceWith(errorEvent);

    await act(async () => {
      sender.current.postMessage("recovered");
      await nextMessageReceived;
    });

    expect(receiver.current.lastMessage).toBe("recovered");
    expect(receiver.current.error).toBeNull();
  });

  it("closes the channel on channelName change and on unmount", async () => {
    const closeSpy = vi.spyOn(BroadcastChannel.prototype, "close");

    const { result, rerender, unmount } = await renderHook(
      (props?: { name: string }) => useBroadcastChannel<string>(props?.name ?? "bc-channel-a"),
      { initialProps: { name: "bc-channel-a" } },
    );

    await rerender({ name: "bc-channel-b" });
    expect(closeSpy).toHaveBeenCalledTimes(1);
    expect(result.current.postMessage("still-active-on-b")).toBe(true);

    await unmount();
    expect(closeSpy).toHaveBeenCalledTimes(2);
    expect(result.current.postMessage("after-unmount")).toBe(false);
  });
});
