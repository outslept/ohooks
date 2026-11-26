import { useFileDialog } from "@/hooks/useFileDialog";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "vitest-browser-react";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe("useFileDialog", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("configures file input attributes, invokes both local and global callbacks, and supports reset on open", async () => {
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, "click");
    const globalOnChange = vi.fn();
    const globalOnCancel = vi.fn();
    const localOnChange = vi.fn();
    const localOnCancel = vi.fn();

    const { result, act } = await renderHook(() =>
      useFileDialog({
        accept: "text/plain",
        multiple: true,
        onChange: globalOnChange,
        onCancel: globalOnCancel,
      }),
    );

    expect(result.current.files).toBeNull();

    await act(async () => {
      result.current.open({
        accept: "image/*",
        multiple: false,
        capture: "user",
        onChange: localOnChange,
      });
    });

    const input1 = clickSpy.mock.instances.at(-1) as HTMLInputElement;
    expect(input1.type).toBe("file");
    expect(input1.accept).toBe("image/*");
    expect(input1.multiple).toBe(false);
    expect(input1.getAttribute("capture")).toBe("user");

    const file = new File(["avatar"], "avatar.png", { type: "image/png" });
    const dt = new DataTransfer();
    dt.items.add(file);

    await act(async () => {
      Object.defineProperty(input1, "files", {
        value: dt.files,
        configurable: true,
      });
      input1.dispatchEvent(new Event("change"));
    });

    expect(result.current.files?.length).toBe(1);
    expect(result.current.files?.[0]?.name).toBe("avatar.png");
    expect(localOnChange).toHaveBeenCalledOnce();
    expect(globalOnChange).toHaveBeenCalledOnce();

    await act(async () => {
      result.current.open({ reset: true });
    });
    expect(result.current.files).toBeNull();

    expect(localOnCancel).not.toHaveBeenCalled();
    await act(async () => {
      result.current.open({ onCancel: localOnCancel });
      const input3 = clickSpy.mock.instances.at(-1) as HTMLInputElement;
      input3.dispatchEvent(new Event("cancel"));
    });
    expect(localOnCancel).toHaveBeenCalled();
    expect(globalOnCancel).toHaveBeenCalled();

    await act(async () => {
      result.current.reset();
    });
    expect(result.current.files).toBeNull();
  });
});
