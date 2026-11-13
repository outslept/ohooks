import {
  DragEvent as ReactDragEvent,
  HTMLAttributes,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useEventCallback } from './useEventCallback';
import {
  EventListenerTarget,
} from './useEventListener';
import { useLatest } from './useLatest';
import { resolveTargetElement } from '@/lib/utils';

export interface UseDropZoneOptions {
  /** Accepted MIME types or file extensions (e.g., `'image/*,.pdf'` or `['image/png', '.jpg']`) */
  accept?: string | readonly string[];
  /** Allow dropping multiple files at once (default: `true`) */
  multiple?: boolean;
  /** Disable drag-and-drop handling (default: `false`) */
  disabled?: boolean;
  /** Prevent default browser behavior for drops outside the drop zone (default: `false`) */
  preventDefaultForUnhandled?: boolean;
  /** Callback invoked when valid files are dropped */
  onDrop?: (files: File[], event: DragEvent | ReactDragEvent) => void;
  /** Callback invoked when dropped files fail MIME/extension or `multiple` validation */
  onDropRejected?: (
    rejectedFiles: File[],
    event: DragEvent | ReactDragEvent
  ) => void;
  /** Callback invoked when a dragged item enters the drop zone */
  onDragEnter?: (event: DragEvent | ReactDragEvent) => void;
  /** Callback invoked while a dragged item moves over the drop zone */
  onDragOver?: (event: DragEvent | ReactDragEvent) => void;
  /** Callback invoked when a dragged item leaves the drop zone */
  onDragLeave?: (event: DragEvent | ReactDragEvent) => void;
}

export interface DropZoneRootProps extends HTMLAttributes<HTMLElement> {
  /** Drag enter handler to attach to the drop zone element */
  onDragEnter: (event: ReactDragEvent<HTMLElement>) => void;
  /** Drag over handler to attach to the drop zone element */
  onDragOver: (event: ReactDragEvent<HTMLElement>) => void;
  /** Drag leave handler to attach to the drop zone element */
  onDragLeave: (event: ReactDragEvent<HTMLElement>) => void;
  /** Drop handler to attach to the drop zone element */
  onDrop: (event: ReactDragEvent<HTMLElement>) => void;
}

export interface UseDropZoneReturn {
  /** Whether a dragged item is currently hovering over the drop zone */
  isOver: boolean;
  /** Whether the currently dragged item violates `accept` or `multiple` rules */
  isInvalid: boolean;
  /** Array of files from the most recent valid drop */
  files: File[];
  /** Clears the `files` state array */
  clearFiles: () => void;
  /** Prop getter for binding drag-and-drop handlers directly onto a JSX element */
  getRootProps: <T extends HTMLElement = HTMLElement>(
    userProps?: HTMLAttributes<T>
  ) => DropZoneRootProps;
}

function normalizeAcceptList(
  accept?: string | readonly string[]
): string[] {
  if (!accept) return [];
  const rawList =
    typeof accept === 'string' ? accept.split(',') : Array.from(accept);
  return rawList.map((item) => item.trim().toLowerCase()).filter(Boolean);
}

function matchesMimeOrExtension(
  mimeType: string,
  fileName: string,
  acceptRules: readonly string[]
): boolean {
  if (acceptRules.length === 0) {
    return true;
  }

  const normalizedMime = mimeType.toLowerCase();
  const normalizedName = fileName.toLowerCase();

  for (const rule of acceptRules) {
    if (rule === '*' || rule === '*/*') {
      return true;
    }
    if (rule.startsWith('.')) {
      if (normalizedName.endsWith(rule)) {
        return true;
      }
    } else if (rule.endsWith('/*')) {
      const baseType = rule.slice(0, -2);
      if (normalizedMime.startsWith(`${baseType}/`)) {
        return true;
      }
    } else if (normalizedMime === rule) {
      return true;
    }
  }

  return false;
}

function isDataTransferInvalid(
  dataTransfer: DataTransfer | null,
  acceptRules: readonly string[],
  multiple: boolean
): boolean {
  if (!dataTransfer) return false;

  const items = Array.from(dataTransfer.items ?? []).filter(
    (item) => item.kind === 'file'
  );

  if (items.length === 0) {
    return false;
  }

  if (!multiple && items.length > 1) {
    return true;
  }

  if (acceptRules.length === 0) {
    return false;
  }

  return items.some((item) => {
    if (!item.type) {
      const hasOnlyExtensionRules = acceptRules.every((r) =>
        r.startsWith('.')
      );
      return !hasOnlyExtensionRules;
    }
    return !matchesMimeOrExtension(item.type, '', acceptRules);
  });
}

function partitionFiles(
  fileList: FileList | null | undefined,
  acceptRules: readonly string[],
  multiple: boolean
): { accepted: File[]; rejected: File[] } {
  if (!fileList || fileList.length === 0) {
    return { accepted: [], rejected: [] };
  }

  const allFiles = Array.from(fileList);
  if (!multiple && allFiles.length > 1) {
    return { accepted: [], rejected: allFiles };
  }

  const accepted: File[] = [];
  const rejected: File[] = [];

  for (const file of allFiles) {
    if (matchesMimeOrExtension(file.type, file.name, acceptRules)) {
      accepted.push(file);
    } else {
      rejected.push(file);
    }
  }

  return { accepted, rejected };
}

/**
 * Handles file drag-and-drop interactions with MIME/extension filtering via a target ref or `getRootProps`.
 *
 * @category DOM
 * @param target - Optional target element/ref, or options object if no target is passed
 * @param options - File validation rules and drag/drop event callbacks
 * @returns Drop zone state (`isOver`, `isInvalid`, `files`), `clearFiles`, and `getRootProps` helper
 *
 * @example
 * ```tsx
 * const { isOver, files, getRootProps } = useDropZone({
 *   accept: 'image/*',
 *   onDrop: (accepted) => console.log(accepted),
 * });
 * ```
 */
export function useDropZone(
  target?: EventListenerTarget<HTMLElement> | UseDropZoneOptions,
  options?: UseDropZoneOptions
): UseDropZoneReturn {
  const isFirstArgOptions =
    typeof target === 'object' &&
    target !== null &&
    !('current' in target) &&
    !('addEventListener' in target) &&
    !('nodeType' in target);

  const resolvedTarget = isFirstArgOptions
    ? undefined
    : (target as EventListenerTarget<HTMLElement> | undefined);
  const resolvedOptions: UseDropZoneOptions = isFirstArgOptions
    ? (target as UseDropZoneOptions)
    : (options ?? {});

  const {
    accept,
    multiple = true,
    disabled = false,
    preventDefaultForUnhandled = false,
  } = resolvedOptions;

  const optionsRef = useLatest(resolvedOptions);

  const [isOver, setIsOver] = useState<boolean>(false);
  const [isInvalid, setIsInvalid] = useState<boolean>(false);
  const [files, setFiles] = useState<File[]>([]);

  const dragCounterRef: { current: number } = useRef(0);

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  const handleDragEnter = useEventCallback(
    (event: DragEvent | ReactDragEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (optionsRef.current.disabled) {
        return;
      }

      dragCounterRef.current += 1;

      if (dragCounterRef.current === 1) {
        const acceptRules = normalizeAcceptList(optionsRef.current.accept);
        const allowMultiple = optionsRef.current.multiple ?? true;
        const invalid = isDataTransferInvalid(
          event.dataTransfer,
          acceptRules,
          allowMultiple
        );

        setIsOver(true);
        setIsInvalid(invalid);
        optionsRef.current.onDragEnter?.(event);
      }
    }
  );

  const handleDragOver = useEventCallback(
    (event: DragEvent | ReactDragEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (optionsRef.current.disabled) {
        return;
      }

      if (event.dataTransfer) {
        const acceptRules = normalizeAcceptList(optionsRef.current.accept);
        const allowMultiple = optionsRef.current.multiple ?? true;
        const invalid = isDataTransferInvalid(
          event.dataTransfer,
          acceptRules,
          allowMultiple
        );
        event.dataTransfer.dropEffect = invalid ? 'none' : 'copy';
        setIsInvalid(invalid);
      }

      setIsOver(true);
      optionsRef.current.onDragOver?.(event);
    }
  );

  const handleDragLeave = useEventCallback(
    (event: DragEvent | ReactDragEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (optionsRef.current.disabled) {
        return;
      }

      dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);

      if (dragCounterRef.current === 0) {
        setIsOver(false);
        setIsInvalid(false);
        optionsRef.current.onDragLeave?.(event);
      }
    }
  );

  const handleDrop = useEventCallback((event: DragEvent | ReactDragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    dragCounterRef.current = 0;
    setIsOver(false);
    setIsInvalid(false);

    if (optionsRef.current.disabled) {
      return;
    }

    const acceptRules = normalizeAcceptList(optionsRef.current.accept);
    const allowMultiple = optionsRef.current.multiple ?? true;

    const { accepted, rejected } = partitionFiles(
      event.dataTransfer?.files,
      acceptRules,
      allowMultiple
    );

    if (rejected.length > 0) {
      optionsRef.current.onDropRejected?.(rejected, event);
    }

    if (accepted.length > 0) {
      setFiles(accepted);
      optionsRef.current.onDrop?.(accepted, event);
    }
  });

  useEffect(() => {
    if (disabled) {
      dragCounterRef.current = 0;
      setIsOver(false);
      setIsInvalid(false);
      return;
    }

    const element = resolveTargetElement(resolvedTarget);
    if (!element) {
      return;
    }

    const onEnter = (e: DragEvent) => handleDragEnter(e);
    const onOver = (e: DragEvent) => handleDragOver(e);
    const onLeave = (e: DragEvent) => handleDragLeave(e);
    const onDropEvent = (e: DragEvent) => handleDrop(e);

    element.addEventListener('dragenter', onEnter);
    element.addEventListener('dragover', onOver);
    element.addEventListener('dragleave', onLeave);
    element.addEventListener('drop', onDropEvent);

    return () => {
      element.removeEventListener('dragenter', onEnter);
      element.removeEventListener('dragover', onOver);
      element.removeEventListener('dragleave', onLeave);
      element.removeEventListener('drop', onDropEvent);
    };
  }, [
    resolvedTarget,
    disabled,
    accept,
    multiple,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  ]);

  useEffect(() => {
    if (!preventDefaultForUnhandled || typeof window === 'undefined') {
      return;
    }

    const preventDefault = (event: DragEvent) => {
      event.preventDefault();
    };

    window.addEventListener('dragover', preventDefault);
    window.addEventListener('drop', preventDefault);

    return () => {
      window.removeEventListener('dragover', preventDefault);
      window.removeEventListener('drop', preventDefault);
    };
  }, [preventDefaultForUnhandled]);

  const getRootProps = useCallback(
    <T extends HTMLElement = HTMLElement>(
      userProps: HTMLAttributes<T> = {}
    ): DropZoneRootProps => ({
      ...userProps,
      onDragEnter: (event: ReactDragEvent<HTMLElement>) => {
        userProps.onDragEnter?.(event as ReactDragEvent<T>);
        handleDragEnter(event);
      },
      onDragOver: (event: ReactDragEvent<HTMLElement>) => {
        userProps.onDragOver?.(event as ReactDragEvent<T>);
        handleDragOver(event);
      },
      onDragLeave: (event: ReactDragEvent<HTMLElement>) => {
        userProps.onDragLeave?.(event as ReactDragEvent<T>);
        handleDragLeave(event);
      },
      onDrop: (event: ReactDragEvent<HTMLElement>) => {
        userProps.onDrop?.(event as ReactDragEvent<T>);
        handleDrop(event);
      },
    }),
    [handleDragEnter, handleDragOver, handleDragLeave, handleDrop]
  );

  return {
    isOver,
    isInvalid,
    files,
    clearFiles,
    getRootProps,
  };
}

export default useDropZone;
