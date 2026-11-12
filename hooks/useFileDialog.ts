import { useCallback, useEffect, useRef, useState } from 'react';
import { useLatest } from './useLatest';

export interface UseFileDialogOptions {
  multiple?: boolean;
  accept?: string;
  capture?: string;
  directory?: boolean;
  reset?: boolean;
  onChange?: (files: FileList | null) => void;
  onCancel?: () => void;
}

export interface UseFileDialogReturn {
  files: FileList | null;
  open: (localOptions?: Partial<UseFileDialogOptions>) => void;
  reset: () => void;
}

const DEFAULT_OPTIONS: Required<
  Pick<
    UseFileDialogOptions,
    'multiple' | 'accept' | 'directory' | 'reset'
  >
> = {
  multiple: true,
  accept: '*',
  directory: false,
  reset: false,
};

export function useFileDialog(
  options: UseFileDialogOptions = {}
): UseFileDialogReturn {
  const [files, setFiles] = useState<FileList | null>(null);
  const inputRef: { current: HTMLInputElement | null } = useRef(null);
  const optionsRef = useLatest(options);
  const localOptionsRef: {
    current: Partial<UseFileDialogOptions> | undefined;
  } = useRef(undefined);

  const reset = useCallback(() => {
    setFiles(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, []);

  const getOrCreateInput = useCallback((): HTMLInputElement | null => {
    if (typeof document === 'undefined') {
      return null;
    }

    if (!inputRef.current) {
      const input = document.createElement('input');
      input.type = 'file';

      input.onchange = (event: Event) => {
        const target = event.target as HTMLInputElement;
        const selectedFiles = target.files;
        setFiles(selectedFiles);

        const localOnChange = localOptionsRef.current?.onChange;
        const globalOnChange = optionsRef.current.onChange;

        if (localOnChange) {
          localOnChange(selectedFiles);
        }
        if (globalOnChange && globalOnChange !== localOnChange) {
          globalOnChange(selectedFiles);
        }
      };

      input.oncancel = () => {
        const localOnCancel = localOptionsRef.current?.onCancel;
        const globalOnCancel = optionsRef.current.onCancel;

        if (localOnCancel) {
          localOnCancel();
        }
        if (globalOnCancel && globalOnCancel !== localOnCancel) {
          globalOnCancel();
        }
      };

      inputRef.current = input;
    }

    return inputRef.current;
  }, [optionsRef]);

  const open = useCallback(
    (localOptions?: Partial<UseFileDialogOptions>) => {
      const input = getOrCreateInput();
      if (!input) return;

      localOptionsRef.current = localOptions;

      const merged: UseFileDialogOptions = {
        ...DEFAULT_OPTIONS,
        ...optionsRef.current,
        ...localOptions,
      };

      if (merged.reset) {
        reset();
      }

      input.multiple = Boolean(merged.multiple);
      input.accept = merged.accept ?? '*';

      if (merged.capture !== undefined) {
        input.setAttribute('capture', merged.capture);
      } else {
        input.removeAttribute('capture');
      }

      if (merged.directory) {
        input.setAttribute('webkitdirectory', '');
      } else {
        input.removeAttribute('webkitdirectory');
      }

      input.click();
    },
    [getOrCreateInput, optionsRef, reset]
  );

  useEffect(() => {
    return () => {
      if (inputRef.current) {
        inputRef.current.onchange = null;
        inputRef.current.oncancel = null;
        inputRef.current = null;
      }
    };
  }, []);

  return {
    files,
    open,
    reset,
  };
}

export default useFileDialog;
