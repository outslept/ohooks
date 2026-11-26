import { useInfiniteScroll, type UseInfiniteScrollOptions } from "@/hooks/useInfiniteScroll";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { renderHook } from "vitest-browser-react";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe("useInfiniteScroll", () => {
  let sentinel: HTMLDivElement;

  beforeEach(() => {
    sentinel = document.createElement("div");
    sentinel.style.width = "50px";
    sentinel.style.height = "50px";
    document.body.appendChild(sentinel);
  });

  afterEach(() => {
    sentinel.remove();
  });

  it("triggers onLoadMore when sentinel intersects, tracks isLoading, and ignores concurrent calls", async () => {
    let resolveLoad!: () => void;
    let notifyStarted!: () => void;
    const started = new Promise<void>((r) => {
      notifyStarted = r;
    });
    const loadGate = new Promise<void>((r) => {
      resolveLoad = r;
    });
    let callCount = 0;

    const { result, act, unmount } = await renderHook(() =>
      useInfiniteScroll(
        sentinel,
        () => {
          callCount += 1;
          notifyStarted();
          return loadGate;
        },
        { threshold: [0, 0.5] },
      ),
    );

    await act(async () => {
      await started;
    });
    expect(result.current.isLoading).toBe(true);
    expect(callCount).toBe(1);

    await act(async () => {
      await result.current.loadMore();
    });
    expect(callCount).toBe(1);

    await act(async () => {
      resolveLoad();
      await loadGate;
    });
    expect(result.current.isLoading).toBe(false);

    await unmount();
  });

  it("does not load when hasMore is false, enabled is false, or sentinel is null", async () => {
    let callCount = 0;

    const { result, rerender, act } = await renderHook(
      (props?: UseInfiniteScrollOptions & { target?: HTMLElement | null }) =>
        useInfiniteScroll(
          props && "target" in props ? (props.target ?? null) : sentinel,
          () => {
            callCount += 1;
          },
          props ?? { hasMore: false, enabled: true },
        ),
    );

    await act(async () => {
      await result.current.loadMore();
    });
    expect(callCount).toBe(0);

    await rerender({ hasMore: true, enabled: false });
    await act(async () => {
      await result.current.loadMore();
    });
    expect(callCount).toBe(0);

    await rerender({ hasMore: true, enabled: true, target: null });
    expect(result.current.isLoading).toBe(false);
  });

  it("avoids state updates if unmounted while onLoadMore is still pending", async () => {
    let resolveLoad!: () => void;
    let notifyStarted!: () => void;
    const started = new Promise<void>((r) => {
      notifyStarted = r;
    });
    const loadGate = new Promise<void>((r) => {
      resolveLoad = r;
    });

    const { result, act, unmount } = await renderHook(() =>
      useInfiniteScroll(sentinel, () => {
        notifyStarted();
        return loadGate;
      }),
    );

    await act(async () => {
      await started;
    });
    expect(result.current.isLoading).toBe(true);

    await unmount();
    await act(async () => {
      resolveLoad();
      await loadGate;
    });
  });
});
