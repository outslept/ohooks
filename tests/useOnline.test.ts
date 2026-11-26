import { useOnline } from "@/hooks/useOnline";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { renderHook } from "vitest-browser-react";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe("useOnline", () => {
  const originalOnLine = Object.getOwnPropertyDescriptor(navigator, "onLine");

  afterEach(() => {
    if (originalOnLine) {
      Object.defineProperty(navigator, "onLine", originalOnLine);
    } else {
      Reflect.deleteProperty(navigator, "onLine");
    }
  });

  it("returns true during SSR and tracks navigator.onLine across online/offline events", async () => {
    const ServerProbe = () => createElement("span", null, String(useOnline()));
    expect(renderToString(createElement(ServerProbe))).toBe("<span>true</span>");

    Object.defineProperty(navigator, "onLine", {
      value: true,
      configurable: true,
    });

    const { result, act } = await renderHook(() => useOnline());
    expect(result.current).toBe(true);

    await act(async () => {
      Object.defineProperty(navigator, "onLine", {
        value: false,
        configurable: true,
      });
      window.dispatchEvent(new Event("offline"));
    });
    expect(result.current).toBe(false);

    await act(async () => {
      Object.defineProperty(navigator, "onLine", {
        value: true,
        configurable: true,
      });
      window.dispatchEvent(new Event("online"));
    });
    expect(result.current).toBe(true);
  });
});
