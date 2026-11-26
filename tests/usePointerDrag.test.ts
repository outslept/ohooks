import { usePointerDrag, type UsePointerDragOptions } from "@/hooks/usePointerDrag";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "vitest-browser-react";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe("usePointerDrag", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    document.body.style.userSelect = "";
  });

  it("tracks drag lifecycle with threshold, axis lock, userSelect restoration, and ignores secondary pointers or buttons", async () => {
    const box = document.createElement("div");
    document.body.appendChild(box);
    document.body.style.userSelect = "text";

    const onDragStart = vi.fn();
    const onDragMove = vi.fn();
    const onDragEnd = vi.fn();

    const { result, act } = await renderHook(() =>
      usePointerDrag(box, {
        axis: "x",
        threshold: 10,
        preventUserSelect: true,
        onDragStart,
        onDragMove,
        onDragEnd,
      }),
    );

    await act(async () => {
      box.dispatchEvent(
        new PointerEvent("pointerdown", {
          pointerId: 99,
          pointerType: "mouse",
          button: 2,
          clientX: 100,
          clientY: 100,
        }),
      );
    });
    expect(document.body.style.userSelect).toBe("text");

    await act(async () => {
      box.dispatchEvent(
        new PointerEvent("pointerdown", {
          pointerId: 1,
          pointerType: "mouse",
          button: 0,
          clientX: 100,
          clientY: 100,
          bubbles: true,
        }),
      );

      box.dispatchEvent(
        new PointerEvent("pointerdown", {
          pointerId: 2,
          pointerType: "touch",
          clientX: 0,
          clientY: 0,
        }),
      );

      window.dispatchEvent(
        new PointerEvent("pointermove", {
          pointerId: 1,
          clientX: 105,
          clientY: 105,
        }),
      );
    });
    expect(result.current.isDragging).toBe(false);

    await act(async () => {
      window.dispatchEvent(
        new PointerEvent("pointermove", {
          pointerId: 1,
          clientX: 120,
          clientY: 150,
        }),
      );
    });
    expect(result.current.isDragging).toBe(true);
    expect(result.current.deltaX).toBe(20);
    expect(result.current.deltaY).toBe(0);
    expect(onDragStart).toHaveBeenCalledTimes(1);

    await act(async () => {
      window.dispatchEvent(
        new PointerEvent("pointermove", {
          pointerId: 2,
          clientX: 500,
          clientY: 500,
        }),
      );
      window.dispatchEvent(
        new PointerEvent("pointermove", {
          pointerId: 1,
          clientX: 125,
          clientY: 160,
        }),
      );
    });
    expect(result.current.deltaX).toBe(25);
    expect(result.current.movementX).toBe(5);
    expect(result.current.deltaY).toBe(0);
    expect(result.current.movementY).toBe(0);
    expect(document.body.style.userSelect).toBe("none");
    expect(onDragMove).toHaveBeenCalledTimes(1);

    await act(async () => {
      window.dispatchEvent(
        new PointerEvent("pointerup", {
          pointerId: 1,
          clientX: 130,
          clientY: 160,
        }),
      );
    });
    expect(result.current.isDragging).toBe(false);
    expect(document.body.style.userSelect).toBe("text");
    expect(onDragEnd).toHaveBeenCalledTimes(1);
  });

  it("starts immediately when threshold is 0, supports axis: y, preventDefault, pointercancel, and enabled: false", async () => {
    const box = document.createElement("div");
    document.body.appendChild(box);

    const { result, rerender, act, unmount } = await renderHook(
      (props?: UsePointerDragOptions) =>
        usePointerDrag(box, {
          axis: "y",
          threshold: 0,
          preventDefault: true,
          ...props,
        }),
      { initialProps: { enabled: true } },
    );

    const downEvent = new PointerEvent("pointerdown", {
      pointerId: 5,
      button: 0,
      clientX: 10,
      clientY: 20,
      cancelable: true,
    });

    await act(async () => {
      box.dispatchEvent(downEvent);
    });
    expect(downEvent.defaultPrevented).toBe(true);
    expect(result.current.isDragging).toBe(true);

    const moveEvent = new PointerEvent("pointermove", {
      pointerId: 5,
      clientX: 50,
      clientY: 70,
      cancelable: true,
    });
    await act(async () => {
      window.dispatchEvent(moveEvent);
    });
    expect(moveEvent.defaultPrevented).toBe(true);
    expect(result.current.deltaX).toBe(0);
    expect(result.current.deltaY).toBe(50);

    await act(async () => {
      window.dispatchEvent(new PointerEvent("pointercancel", { pointerId: 5 }));
    });
    expect(result.current.isDragging).toBe(false);

    await rerender({ enabled: false });
    await act(async () => {
      box.dispatchEvent(new PointerEvent("pointerdown", { pointerId: 6, button: 0 }));
    });
    expect(result.current.isDragging).toBe(false);

    await unmount();
  });
});
