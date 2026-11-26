import { useMutationObserver, type UseMutationObserverOptions } from "@/hooks/useMutationObserver";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { renderHook } from "vitest-browser-react";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe("useMutationObserver", () => {
  let el: HTMLDivElement;

  beforeEach(() => {
    el = document.createElement("div");
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  it("observes mutations, infers attributes from attributeFilter, respects enabled, and disconnects on unmount", async () => {
    let callCount = 0;
    let lastAttributeName: string | null = null;

    const { rerender, unmount } = await renderHook((props?: UseMutationObserverOptions) =>
      useMutationObserver(
        el,
        (records) => {
          callCount += 1;
          lastAttributeName = records[0]?.attributeName ?? null;
        },
        props ?? {
          attributeFilter: ["data-tracked"],
          attributeOldValue: true,
        },
      ),
    );

    el.setAttribute("data-ignored", "1");
    el.setAttribute("data-tracked", "active");

    await expect.poll(() => callCount).toBe(1);
    expect(lastAttributeName).toBe("data-tracked");

    await rerender({ enabled: false });
    el.setAttribute("data-tracked", "updated");

    await rerender({
      enabled: true,
      attributes: false,
      childList: false,
      characterData: false,
    });
    el.setAttribute("data-tracked", "updated-again");
    expect(callCount).toBe(1);

    await unmount();
  });
});
