import { useNetworkInformation } from "@/hooks/useNetworkInformation";
import { afterEach, describe, expect, it } from "vitest";
import { renderHook } from "vitest-browser-react";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe("useNetworkInformation", () => {
  const originalConnection = Object.getOwnPropertyDescriptor(navigator, "connection");
  const originalOnLine = Object.getOwnPropertyDescriptor(navigator, "onLine");

  afterEach(() => {
    if (originalConnection) {
      Object.defineProperty(navigator, "connection", originalConnection);
    } else {
      Reflect.deleteProperty(navigator, "connection");
    }
    if (originalOnLine) {
      Object.defineProperty(navigator, "onLine", originalOnLine);
    } else {
      Reflect.deleteProperty(navigator, "onLine");
    }
  });

  it("reads navigator.connection metrics, preserves snapshot identity when unchanged, and reacts to change and online/offline events", async () => {
    Object.defineProperty(navigator, "onLine", {
      value: true,
      configurable: true,
    });
    const fakeConnection = Object.assign(new EventTarget(), {
      downlink: 10,
      downlinkMax: 100,
      effectiveType: "4g" as "4g" | "3g",
      rtt: 50,
      saveData: false,
      type: "wifi" as "wifi" | "cellular",
    });
    Object.defineProperty(navigator, "connection", {
      value: fakeConnection,
      configurable: true,
    });

    const { result, act } = await renderHook(() => useNetworkInformation());

    expect(result.current).toEqual({
      isOnline: true,
      isSupported: true,
      downlink: 10,
      downlinkMax: 100,
      effectiveType: "4g",
      rtt: 50,
      saveData: false,
      type: "wifi",
    });

    const prevSnapshot = result.current;
    await act(async () => {
      fakeConnection.dispatchEvent(new Event("change"));
    });
    expect(result.current).toBe(prevSnapshot);

    await act(async () => {
      fakeConnection.effectiveType = "3g";
      fakeConnection.rtt = 150;
      fakeConnection.saveData = true;
      fakeConnection.dispatchEvent(new Event("change"));
    });
    expect(result.current.effectiveType).toBe("3g");
    expect(result.current.rtt).toBe(150);
    expect(result.current.saveData).toBe(true);

    await act(async () => {
      Object.defineProperty(navigator, "onLine", {
        value: false,
        configurable: true,
      });
      window.dispatchEvent(new Event("offline"));
    });
    expect(result.current.isOnline).toBe(false);
  });

  it("reports isSupported: false when Network Information API is unavailable", async () => {
    Object.defineProperty(navigator, "connection", {
      value: undefined,
      configurable: true,
    });

    const { result } = await renderHook(() => useNetworkInformation());
    expect(result.current.isSupported).toBe(false);
  });
});
