import { useScrollSpy, type ScrollSpyTarget } from "@/hooks/useScrollSpy";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { renderHook } from "vitest-browser-react";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe("useScrollSpy", () => {
  let rootEl: HTMLDivElement;
  let s1: HTMLElement;
  let s2: HTMLElement;

  beforeEach(() => {
    rootEl = document.createElement("div");
    rootEl.style.height = "120px";
    rootEl.style.overflow = "auto";

    s1 = document.createElement("section");
    s1.id = "sec-1";
    s1.style.height = "60px";

    s2 = document.createElement("section");
    s2.id = "sec-2";
    s2.style.height = "60px";

    rootEl.append(s1, s2);
    document.body.appendChild(rootEl);
  });

  afterEach(() => {
    rootEl.remove();
  });

  it("identifies the topmost visible section inside root across selector, id, ref, and element targets", async () => {
    const s2Ref = { current: s2 };
    const defaultTargets: readonly ScrollSpyTarget[] = ["#sec-1", "sec-1", s2Ref, s2];

    const { result, rerender } = await renderHook(
      (props?: { targets: readonly ScrollSpyTarget[] }) =>
        useScrollSpy(props?.targets ?? defaultTargets, {
          root: rootEl,
          rootMargin: "0px",
          threshold: [0, 0.5],
          offset: 10,
        }),
    );

    await expect.poll(() => result.current).toBe("sec-1");

    s1.style.display = "none";
    await expect.poll(() => result.current).toBe("sec-2");

    await rerender({ targets: ["   "] });
    expect(result.current).toBeNull();
  });
});
