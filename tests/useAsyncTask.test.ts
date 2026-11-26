import { useAsyncTask, type AsyncTaskContext } from "@/hooks/useAsyncTask";
import { describe, expect, it, vi } from "vitest";
import { renderHook } from "vitest-browser-react";

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
}

function createDeferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("useAsyncTask", () => {
  it("starts idle and transitions to success while preserving data across runs by default", async () => {
    const onSuccess = vi.fn();
    const { result, act } = await renderHook(() =>
      useAsyncTask(
        async (_ctx, value: number) => {
          if (value < 0) {
            throw new Error("negative");
          }
          return value * 2;
        },
        { onSuccess },
      ),
    );

    expect(result.current.status).toBe("idle");
    expect(result.current.isIdle).toBe(true);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeNull();

    let returnedValue: number | undefined;
    await act(async () => {
      returnedValue = await result.current.run(5);
    });

    expect(returnedValue).toBe(10);
    expect(result.current.status).toBe("success");
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.data).toBe(10);
    expect(onSuccess).toHaveBeenCalledExactlyOnceWith(10);

    await act(async () => {
      returnedValue = await result.current.run(-1);
    });

    expect(returnedValue).toBeUndefined();
    expect(result.current.status).toBe("error");
    expect(result.current.isError).toBe(true);
    expect(result.current.data).toBe(10);
    expect(result.current.error?.message).toBe("negative");
  });

  it("resets data to initialData on new run when resetDataOnRun is true and normalizes non-Error throws", async () => {
    const onError = vi.fn();
    const explicitError = new TypeError("invalid type");

    const { result, act } = await renderHook(() =>
      useAsyncTask(
        async (_ctx, mode: "ok" | "string-err" | "error-instance") => {
          if (mode === "string-err") {
            throw "raw-string-error";
          }
          if (mode === "error-instance") {
            throw explicitError;
          }
          return 42;
        },
        { initialData: 0, resetDataOnRun: true, onError },
      ),
    );

    expect(result.current.data).toBe(0);

    await act(async () => {
      await result.current.run("ok");
    });
    expect(result.current.data).toBe(42);

    await act(async () => {
      await result.current.run("string-err");
    });
    expect(result.current.isError).toBe(true);
    expect(result.current.data).toBe(0);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("raw-string-error");
    expect(onError).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.run("error-instance");
    });
    expect(result.current.error).toBe(explicitError);
    expect(onError).toHaveBeenLastCalledWith(explicitError);
  });

  it("aborts an in-flight task with reason and ignores abort calls when no task is running", async () => {
    const onAbort = vi.fn();
    const onSuccess = vi.fn();
    let capturedSignal: AbortSignal | undefined;
    const deferred = createDeferred<string>();

    const { result, act } = await renderHook(() =>
      useAsyncTask(
        ({ signal }: AsyncTaskContext) => {
          capturedSignal = signal;
          return deferred.promise;
        },
        { onAbort, onSuccess },
      ),
    );

    await act(async () => {
      result.current.abort();
    });
    expect(result.current.isIdle).toBe(true);
    expect(onAbort).not.toHaveBeenCalled();

    let runPromise!: Promise<string | undefined>;
    await act(async () => {
      runPromise = result.current.run();
    });

    expect(result.current.isPending).toBe(true);

    await act(async () => {
      result.current.abort("user-cancelled");
      deferred.resolve("late-result");
      await runPromise;
    });

    expect(capturedSignal?.aborted).toBe(true);
    expect(capturedSignal?.reason).toBe("user-cancelled");
    expect(result.current.status).toBe("aborted");
    expect(result.current.isAborted).toBe(true);
    expect(onAbort).toHaveBeenCalledOnce();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("treats an AbortError thrown by the task itself as an aborted state rather than an error", async () => {
    const onAbort = vi.fn();
    const onError = vi.fn();

    const { result, act } = await renderHook(() =>
      useAsyncTask(
        async () => {
          throw new DOMException("The operation was aborted.", "AbortError");
        },
        { onAbort, onError },
      ),
    );

    let returned: never | undefined;
    await act(async () => {
      returned = await result.current.run();
    });

    expect(returned).toBeUndefined();
    expect(result.current.isAborted).toBe(true);
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBeNull();
    expect(onAbort).toHaveBeenCalledOnce();
    expect(onError).not.toHaveBeenCalled();
  });

  it("aborts a pending run when superseded by a newer run and ignores the stale resolution", async () => {
    const firstDeferred = createDeferred<string>();
    const secondDeferred = createDeferred<string>();
    const signals: AbortSignal[] = [];
    const onSuccess = vi.fn();

    const { result, act } = await renderHook(() =>
      useAsyncTask(
        ({ signal }, callNumber: 1 | 2) => {
          signals.push(signal);
          return callNumber === 1 ? firstDeferred.promise : secondDeferred.promise;
        },
        { onSuccess },
      ),
    );

    let p1!: Promise<string | undefined>;
    let p2!: Promise<string | undefined>;

    await act(async () => {
      p1 = result.current.run(1);
      p2 = result.current.run(2);
    });

    expect(signals[0]?.aborted).toBe(true);
    expect(signals[1]?.aborted).toBe(false);
    expect(result.current.isPending).toBe(true);

    await act(async () => {
      firstDeferred.resolve("stale");
      secondDeferred.resolve("fresh");
      const [r1, r2] = await Promise.all([p1, p2]);
      expect(r1).toBeUndefined();
      expect(r2).toBe("fresh");
    });

    expect(result.current.isSuccess).toBe(true);
    expect(result.current.data).toBe("fresh");
    expect(onSuccess).toHaveBeenCalledExactlyOnceWith("fresh");
  });

  it("aborts in-flight work and restores initial state when reset is called", async () => {
    const deferred = createDeferred<number>();
    let capturedSignal: AbortSignal | undefined;
    const onSuccess = vi.fn();

    const { result, act } = await renderHook(() =>
      useAsyncTask(
        ({ signal }) => {
          capturedSignal = signal;
          return deferred.promise;
        },
        { initialData: 100, onSuccess },
      ),
    );

    let runPromise!: Promise<number | undefined>;
    await act(async () => {
      runPromise = result.current.run();
    });
    expect(result.current.isPending).toBe(true);

    await act(async () => {
      result.current.reset();
      deferred.resolve(999);
      await runPromise;
    });

    expect(capturedSignal?.aborted).toBe(true);
    expect(result.current.isIdle).toBe(true);
    expect(result.current.data).toBe(100);
    expect(result.current.error).toBeNull();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("aborts in-flight task on unmount and suppresses post-unmount callbacks", async () => {
    const deferred = createDeferred<string>();
    let capturedSignal: AbortSignal | undefined;
    const onSuccess = vi.fn();
    const onAbort = vi.fn();

    const { result, unmount, act } = await renderHook(() =>
      useAsyncTask(
        ({ signal }) => {
          capturedSignal = signal;
          return deferred.promise;
        },
        { onSuccess, onAbort },
      ),
    );

    let runPromise!: Promise<string | undefined>;
    await act(async () => {
      runPromise = result.current.run();
    });

    await unmount();

    expect(capturedSignal?.aborted).toBe(true);

    await act(async () => {
      deferred.resolve("after-unmount");
      const resolved = await runPromise;
      expect(resolved).toBeUndefined();
    });

    expect(onSuccess).not.toHaveBeenCalled();
    expect(onAbort).not.toHaveBeenCalled();
  });
});
