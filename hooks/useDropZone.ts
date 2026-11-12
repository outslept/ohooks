import { type DragEvent as ReactDragEvent, useRef, useState } from 'react';
import { useEventCallback } from './useEventCallback';

export interface UseDropZoneOptions<T = HTMLElement> {
  accept?: string | ReadonlyArray<string>;
  multiple?: boolean;
  disabled?: boolean;
  onDrop?: (files: File[], event: ReactDragEvent<T>) => void;
  onReject?: (files: File[], event: ReactDragEvent<T>) => void;
  onEnter?: (event: ReactDragEvent<T>) => void;
  onOver?: (event: ReactDragEvent<T>) => void;
  onLeave?: (event: ReactDragEvent<T>) => void;
}

export interface DropZoneBindings<T = HTMLElement> {
  onDragEnter: (event: ReactDragEvent<T>) => void;
  onDragOver: (event: ReactDragEvent<T>) => void;
  onDragLeave: (event: ReactDragEvent<T>) => void;
  onDrop: (event: ReactDragEvent<T>) => void;
}

export interface UseDropZoneReturn<T = HTMLElement> {
  isOver: boolean;
  isInvalid: boolean;
  files: File[];
  clearFiles: () => void;
  bindings: DropZoneBindings<T>;
  getRootProps: () => DropZoneBindings<T>;
}

function parseAcceptList(accept?: string | ReadonlyArray<string>): string[] {
  if (!accept) {
    return [];
  }
  const raw = typeof accept === 'string' ? accept.split(',') : accept;
  return raw
    .map((item: string) => item.trim().toLowerCase())
    .filter(Boolean);
}

function matchesMimeOrExtension(
  mimeType: string,
  fileName: string | undefined,
  patterns: readonly string[],
): boolean {
  if (patterns.length === 0 || patterns.includes('*') || patterns.includes('*/*')) {
    return true;
  }

  const normalizedMime = mimeType.toLowerCase();
  const normalizedName = fileName?.toLowerCase() ?? '';

  return patterns.some((pattern) => {
    if (pattern.startsWith('.')) {
      return normalizedName !== '' && normalizedName.endsWith(pattern);
    }
    if (pattern.endsWith('/*')) {
      const baseType = pattern.slice(0, -2);
      return normalizedMime.startsWith(`${baseType}/`);
    }
    return normalizedMime === pattern;
  });
}

function checkDataTransferValidity(
  dataTransfer: DataTransfer | null,
  patterns: readonly string[],
  multiple: boolean,
): boolean {
  if (!dataTransfer) {
    return true;
  }

  const items = Array.from(dataTransfer.items ?? []);
  const fileItems = items.filter((item) => item.kind === 'file');

  if (fileItems.length === 0) {
    return true;
  }

  if (!multiple && fileItems.length > 1) {
    return false;
  }

  if (patterns.length === 0) {
    return true;
  }

  return fileItems.every((item) => {
    if (!item.type) {
      return true;
    }
    return matchesMimeOrExtension(item.type, undefined, patterns);
  });
}

export function useDropZone<T = HTMLElement>(
  options: UseDropZoneOptions<T> = {},
): UseDropZoneReturn<T> {
  const {
    accept,
    multiple = true,
    disabled = false,
    onDrop,
    onReject,
    onEnter,
    onOver,
    onLeave,
  } = options;

  const [isOver, setIsOver] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const dragCounterRef = useRef(0);

  const acceptPatterns = parseAcceptList(accept);

  const onDragEnter = useEventCallback((event: ReactDragEvent<T>) => {
    event.preventDefault();
    event.stopPropagation();

    if (disabled) {
      return;
    }

    dragCounterRef.current += 1;

    if (dragCounterRef.current === 1) {
      const valid = checkDataTransferValidity(
        event.dataTransfer,
        acceptPatterns,
        multiple,
      );
      setIsOver(true);
      setIsInvalid(!valid);
      onEnter?.(event);
    }
  });

  const onDragOver = useEventCallback((event: ReactDragEvent<T>) => {
    event.preventDefault();
    event.stopPropagation();

    if (disabled) {
      return;
    }

    const valid = checkDataTransferValidity(
      event.dataTransfer,
      acceptPatterns,
      multiple,
    );

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = valid ? 'copy' : 'none';
    }

    setIsOver(true);
    setIsInvalid(!valid);
    onOver?.(event);
  });

  const onDragLeave = useEventCallback((event: ReactDragEvent<T>) => {
    event.preventDefault();
    event.stopPropagation();

    if (disabled) {
      return;
    }

    dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);

    if (dragCounterRef.current === 0) {
      setIsOver(false);
      setIsInvalid(false);
      onLeave?.(event);
    }
  });

  const handleDrop = useEventCallback((event: ReactDragEvent<T>) => {
    event.preventDefault();
    event.stopPropagation();

    dragCounterRef.current = 0;
    setIsOver(false);
    setIsInvalid(false);

    if (disabled || !event.dataTransfer) {
      return;
    }

    const droppedFiles = Array.from(event.dataTransfer.files);
    if (droppedFiles.length === 0) {
      return;
    }

    if (!multiple && droppedFiles.length > 1) {
      onReject?.(droppedFiles, event);
      return;
    }

    const accepted: File[] = [];
    const rejected: File[] = [];

    for (const file of droppedFiles) {
      if (matchesMimeOrExtension(file.type, file.name, acceptPatterns)) {
        accepted.push(file);
      } else {
        rejected.push(file);
      }
    }

    if (rejected.length > 0) {
      onReject?.(rejected, event);
    }

    if (accepted.length > 0) {
      const finalFiles = multiple ? accepted : accepted.slice(0, 1);
      setFiles(finalFiles);
      onDrop?.(finalFiles, event);
    }
  });

  const clearFiles = useEventCallback(() => {
    setFiles([]);
  });

  const bindings: DropZoneBindings<T> = {
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDrop: handleDrop,
  };

  const getRootProps = useEventCallback((): DropZoneBindings<T> => bindings);

  return {
    isOver,
    isInvalid,
    files,
    clearFiles,
    bindings,
    getRootProps,
  };
}
