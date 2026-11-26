import { useInert } from "@/hooks/useInert";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { renderHook } from "vitest-browser-react";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe("useInert", () => {
  let hostContainer: HTMLDivElement;
  let targetEl: HTMLDivElement;
  let siblingEl: HTMLDivElement;
  let styleEl: HTMLStyleElement;

  beforeEach(() => {
    hostContainer = document.createElement("div");
    targetEl = document.createElement("div");
    hostContainer.appendChild(targetEl);
    siblingEl = document.createElement("div");
    styleEl = document.createElement("style");
    document.body.append(hostContainer, siblingEl, styleEl);
  });

  afterEach(() => {
    hostContainer.remove();
    siblingEl.remove();
    styleEl.remove();
  });

  it("applies inert and aria-hidden, reference-counts concurrent locks, and restores pre-existing attributes on release", async () => {
    targetEl.setAttribute("aria-hidden", "false");

    const lock1 = await renderHook(
      (props?: { inert: boolean }) => useInert(targetEl, props?.inert ?? true),
      { initialProps: { inert: true } },
    );
    const lock2 = await renderHook(() => useInert(targetEl, true));

    expect(targetEl.hasAttribute("inert")).toBe(true);
    expect(targetEl.getAttribute("aria-hidden")).toBe("true");

    await lock1.rerender({ inert: false });
    expect(targetEl.hasAttribute("inert")).toBe(true);
    expect(targetEl.getAttribute("aria-hidden")).toBe("true");

    await lock2.unmount();
    expect(targetEl.hasAttribute("inert")).toBe(false);
    expect(targetEl.getAttribute("aria-hidden")).toBe("false");
    await lock1.unmount();
  });

  it("traps top-level body siblings while skipping target ancestors and script/style tags", async () => {
    const { unmount } = await renderHook(() => useInert(targetEl, true, { trapSiblings: true }));

    expect(siblingEl.hasAttribute("inert")).toBe(true);
    expect(siblingEl.getAttribute("aria-hidden")).toBe("true");

    expect(targetEl.hasAttribute("inert")).toBe(false);
    expect(hostContainer.hasAttribute("inert")).toBe(false);
    expect(styleEl.hasAttribute("inert")).toBe(false);

    await unmount();
    expect(siblingEl.hasAttribute("inert")).toBe(false);
    expect(siblingEl.hasAttribute("aria-hidden")).toBe(false);
  });
});
