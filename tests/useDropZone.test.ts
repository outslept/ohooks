import { useDropZone } from "@/hooks/useDropZone";
import type React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "vitest-browser-react";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

function createDataTransfer(files: File[]): DataTransfer {
  const dt = new DataTransfer();
  for (const file of files) {
    dt.items.add(file);
  }
  return dt;
}

describe("useDropZone", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("handles nested dragenter/dragleave depth and drops valid files on target element", async () => {
    const dropArea = document.createElement("div");
    document.body.appendChild(dropArea);

    const onDragEnter = vi.fn();
    const onDragOver = vi.fn();
    const onDragLeave = vi.fn();
    const onDrop = vi.fn();

    const { result, act } = await renderHook(() =>
      useDropZone(dropArea, {
        onDragEnter,
        onDragOver,
        onDragLeave,
        onDrop,
      }),
    );

    const file = new File(["hello"], "hello.txt", { type: "text/plain" });
    const dt = createDataTransfer([file]);

    await act(async () => {
      dropArea.dispatchEvent(
        new DragEvent("dragenter", { bubbles: true, cancelable: true, dataTransfer: dt }),
      );

      dropArea.dispatchEvent(
        new DragEvent("dragenter", { bubbles: true, cancelable: true, dataTransfer: dt }),
      );
    });
    expect(result.current.isOver).toBe(true);
    expect(onDragEnter).toHaveBeenCalledTimes(1);

    await act(async () => {
      dropArea.dispatchEvent(
        new DragEvent("dragover", { bubbles: true, cancelable: true, dataTransfer: dt }),
      );

      dropArea.dispatchEvent(
        new DragEvent("dragleave", { bubbles: true, cancelable: true, dataTransfer: dt }),
      );
    });
    expect(onDragOver).toHaveBeenCalledTimes(1);
    expect(result.current.isOver).toBe(true);
    expect(onDragLeave).not.toHaveBeenCalled();

    await act(async () => {
      dropArea.dispatchEvent(
        new DragEvent("dragleave", { bubbles: true, cancelable: true, dataTransfer: dt }),
      );
    });
    expect(result.current.isOver).toBe(false);
    expect(onDragLeave).toHaveBeenCalledTimes(1);

    await act(async () => {
      dropArea.dispatchEvent(
        new DragEvent("dragenter", { bubbles: true, cancelable: true, dataTransfer: dt }),
      );
      dropArea.dispatchEvent(
        new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: dt }),
      );
    });
    expect(result.current.isOver).toBe(false);
    expect(result.current.files).toEqual([file]);
    expect(onDrop).toHaveBeenCalledWith([file], expect.any(DragEvent));
  });

  it("validates accept rules and multiple=false via options-first overload and getRootProps", async () => {
    const onDrop = vi.fn();
    const onDropRejected = vi.fn();
    const userOnDragEnter = vi.fn();

    const { result, act } = await renderHook(() =>
      useDropZone({
        accept: ["image/*", ".pdf"],
        multiple: false,
        preventDefaultForUnhandled: true,
        onDrop,
        onDropRejected,
      }),
    );

    const pngFile = new File(["img"], "photo.png", { type: "image/png" });
    const pdfFile = new File(["doc"], "manual.pdf", { type: "application/pdf" });
    const txtFile = new File(["txt"], "notes.txt", { type: "text/plain" });

    const invalidDt = createDataTransfer([txtFile]);
    await act(async () => {
      result.current.getRootProps({ onDragEnter: userOnDragEnter }).onDragEnter(
        new DragEvent("dragenter", {
          bubbles: true,
          cancelable: true,
          dataTransfer: invalidDt,
        }) as unknown as React.DragEvent<HTMLElement>,
      );
    });
    expect(userOnDragEnter).toHaveBeenCalledTimes(1);
    expect(result.current.isOver).toBe(true);
    expect(result.current.isInvalid).toBe(true);

    await act(async () => {
      result.current.getRootProps().onDrop(
        new DragEvent("drop", {
          bubbles: true,
          cancelable: true,
          dataTransfer: invalidDt,
        }) as unknown as React.DragEvent<HTMLElement>,
      );
    });
    expect(result.current.files).toEqual([]);
    expect(onDrop).not.toHaveBeenCalled();
    expect(onDropRejected).toHaveBeenCalledWith([txtFile], expect.any(DragEvent));

    const multiDt = createDataTransfer([pngFile, pdfFile]);
    await act(async () => {
      result.current.getRootProps().onDragOver(
        new DragEvent("dragover", {
          bubbles: true,
          cancelable: true,
          dataTransfer: multiDt,
        }) as unknown as React.DragEvent<HTMLElement>,
      );
    });
    expect(result.current.isOver).toBe(true);
    expect(result.current.isInvalid).toBe(true);

    const validOverDt = createDataTransfer([pngFile]);
    await act(async () => {
      result.current.getRootProps().onDragOver(
        new DragEvent("dragover", {
          bubbles: true,
          cancelable: true,
          dataTransfer: validOverDt,
        }) as unknown as React.DragEvent<HTMLElement>,
      );
    });
    expect(result.current.isOver).toBe(true);
    expect(result.current.isInvalid).toBe(false);

    const validDropDt = createDataTransfer([pdfFile]);
    await act(async () => {
      result.current.getRootProps().onDrop(
        new DragEvent("drop", {
          bubbles: true,
          cancelable: true,
          dataTransfer: validDropDt,
        }) as unknown as React.DragEvent<HTMLElement>,
      );
    });
    expect(result.current.files).toEqual([pdfFile]);
    expect(onDrop).toHaveBeenCalledTimes(1);

    const unhandledEvent = new DragEvent("dragover", { cancelable: true });
    window.dispatchEvent(unhandledEvent);
    expect(unhandledEvent.defaultPrevented).toBe(true);

    await act(async () => {
      result.current.clearFiles();
    });
    expect(result.current.files).toEqual([]);
  });

  it("ignores all drag events when disabled is true", async () => {
    const onDragEnter = vi.fn();
    const onDrop = vi.fn();
    const { result, act } = await renderHook(() =>
      useDropZone({ disabled: true, onDragEnter, onDrop }),
    );

    const dt = createDataTransfer([new File(["a"], "a.txt", { type: "text/plain" })]);

    await act(async () => {
      result.current.getRootProps().onDragEnter(
        new DragEvent("dragenter", {
          dataTransfer: dt,
        }) as unknown as React.DragEvent<HTMLElement>,
      );
      result.current
        .getRootProps()
        .onDrop(
          new DragEvent("drop", { dataTransfer: dt }) as unknown as React.DragEvent<HTMLElement>,
        );
    });

    expect(result.current.isOver).toBe(false);
    expect(onDragEnter).not.toHaveBeenCalled();
    expect(onDrop).not.toHaveBeenCalled();
  });
});
