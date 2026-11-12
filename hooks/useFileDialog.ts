import { useMemo, useRef, useState } from 'react';
import { useEventCallback } from './useEventCallback';
import { useUnmount } from './useUnmount';

export interface UseFileDialogOptions {
  accept?: string;
  multiple?: boolean;
  capture?: string | boolean;
  directory?: boolean;
  resetOnOpen?: boolean;
  onChange?: (files: FileList | null) => void;
  onCancel?: () => void;
}

export interface UseFileDialogReturn {
  files: FileList | null;
  fileArray: File[];
  open: (localOptions?: Partial<UseFileDialogOptions>) => void;
  reset: () => void;
}

interface DirectoryInputElement extends HTMLInputElement {
  webkitdirectory?: boolean;
}

export function useFileDialog(
  options: UseFileDialogOptions = {},
): UseFileDialogReturn {
  const {
    accept = '*',
    multiple = true,
    capture,
    directory = false,
    resetOnOpen = false,
    onChange,
    onCancel,
  } = options;

  const [files, setFiles] = useState<FileList | null>(null);
  const inputRef = useRef<DirectoryInputElement | null>(null);

  const fileArray = useMemo(
    () => (files ? Array.from(files) : []),
    [files],
  );

  const reset = useEventCallback(() => {
    setFiles(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  });

  const open = useEventCallback(
    (localOptions?: Partial<UseFileDialogOptions>) => {
      if (typeof document === 'undefined') {
        return;
      }

      const merged = {
        accept,
        multiple,
        capture,
        directory,
        resetOnOpen,
        ...localOptions,
      };

      if (merged.resetOnOpen) {
        reset();
      }

      if (!inputRef.current) {
        const input = document.createElement('input') as DirectoryInputElement;
        input.type = 'file';
        input.style.display = 'none';

        input.addEventListener('change', () => {
          const selectedFiles = input.files;
          setFiles(selectedFiles);
          onChange?.(selectedFiles);
        });

        input.addEventListener('cancel', () => {
          onCancel?.();
        });

        inputRef.current = input;
      }

      const input = inputRef.current;
      input.value = '';
      input.accept = merged.accept;
      input.multiple = merged.multiple;

      if (merged.directory) {
        input.webkitdirectory = true;
        input.setAttribute('webkitdirectory', '');
      } else {
        input.webkitdirectory = false;
        input.removeAttribute('webkitdirectory');
      }

      if (merged.capture !== undefined && merged.capture !== false) {
        input.setAttribute(
          'capture',
          typeof merged.capture === 'string' ? merged.capture : '',
        );
      } else {
        input.removeAttribute('capture');
      }

      input.click();
    },
  );

  useUnmount(() => {
    if (inputRef.current) {
      inputRef.current.remove();
      inputRef.current = null;
    }
  });

  return {
    files,
    fileArray,
    open,
    reset,
  };
}
