import { useMouse } from "@/hooks/useMouse";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "vitest-browser-react";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe("useMouse", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("tracks viewport, page, screen, and target-relative coordinates via real rAF and cancels superseded frames", async () => {
    const cancelSpy = vi.spyOn(window, "cancelAnimationFrame");

    const box = document.createElement("div");
    Object.assign(box.style, {
      position: "fixed",
      left: "50px",
      top: "60px",
      width: "200px",
      height: "120px",
    });
    document.body.appendChild(box);

    const { result, unmount, act } = await renderHook(() => useMouse(box));

    expect(result.current.clientX).toBe(0);
    expect(result.current.elementX).toBe(0);

    await act(async () => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 10, clientY: 20 }));
      window.dispatchEvent(
        new MouseEvent("mousemove", {
          clientX: 150,
          clientY: 260,
          screenX: 300,
          screenY: 400,
        }),
      );
    });

    expect(cancelSpy).toHaveBeenCalledTimes(1);

    await expect.poll(() => result.current.clientX).toBe(150);
    expect(result.current.clientY).toBe(260);
    expect(result.current.screenX).toBe(300);
    expect(result.current.screenY).toBe(400);
    expect(result.current.elementPositionX).toBe(50);
    expect(result.current.elementPositionY).toBe(60);
    expect(result.current.elementX).toBe(100);
    expect(result.current.elementY).toBe(200);

    window.dispatchEvent(new MouseEvent("mousemove", { clientX: 80, clientY: 90 }));
    await unmount();

    expect(cancelSpy).toHaveBeenCalledTimes(2);
    expect(result.current.clientX).toBe(150);
  });
});
