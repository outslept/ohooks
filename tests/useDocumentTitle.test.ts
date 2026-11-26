import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { beforeEach, describe, expect, it } from "vitest";
import { renderHook } from "vitest-browser-react";

describe("useDocumentTitle", () => {
  beforeEach(() => {
    document.title = "Original Title";
  });

  it("updates document.title on mount and rerender and keeps it on unmount by default", async () => {
    const { rerender, unmount } = await renderHook(
      (props?: { title: string }) => useDocumentTitle(props?.title ?? "Page 1"),
      { initialProps: { title: "Page 1" } },
    );

    expect(document.title).toBe("Page 1");

    await rerender({ title: "Page 2" });
    expect(document.title).toBe("Page 2");

    await unmount();
    expect(document.title).toBe("Page 2");
  });

  it("restores the initial document.title on unmount when restoreOnUnmount is true", async () => {
    const { rerender, unmount } = await renderHook(
      (props?: { title: string }) =>
        useDocumentTitle(props?.title ?? "Step 1", { restoreOnUnmount: true }),
      { initialProps: { title: "Step 1" } },
    );

    expect(document.title).toBe("Step 1");

    await rerender({ title: "Step 2" });
    expect(document.title).toBe("Step 2");

    await unmount();
    expect(document.title).toBe("Original Title");
  });
});
