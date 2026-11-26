import { useDocumentVisibility } from "@/hooks/useDocumentVisibility";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "vitest-browser-react";

describe("useDocumentVisibility", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reads initial document.visibilityState, updates on visibilitychange, and cleans up listener on unmount", async () => {
    const visibilitySpy = vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    const removeListenerSpy = vi.spyOn(document, "removeEventListener");

    const { result, unmount, act } = await renderHook(() => useDocumentVisibility());

    expect(result.current).toBe("hidden");

    await act(async () => {
      visibilitySpy.mockReturnValue("visible");
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(result.current).toBe("visible");

    await act(async () => {
      visibilitySpy.mockReturnValue("hidden");
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(result.current).toBe("hidden");

    await unmount();
    expect(removeListenerSpy).toHaveBeenCalledWith("visibilitychange", expect.any(Function));
  });
});
