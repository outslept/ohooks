import { useEffect, useState } from 'react';

export type ExtendedPermissionName =
  | PermissionName
  | 'camera'
  | 'microphone'
  | 'speaker-selection'
  | 'clipboard-read'
  | 'clipboard-write'
  | 'local-fonts'
  | 'window-management';

export interface ExtendedPermissionDescriptor {
  name: ExtendedPermissionName;
  [key: string]: unknown;
}

export type UsePermissionState = PermissionState | 'loading' | 'unsupported';

export function usePermission(
  permission: ExtendedPermissionName | ExtendedPermissionDescriptor,
): UsePermissionState {
  const [state, setState] = useState<UsePermissionState>('loading');

  const descriptorKey =
    typeof permission === 'string'
      ? permission
      : JSON.stringify(permission);

  useEffect(() => {
    if (
      typeof navigator === 'undefined' ||
      !navigator.permissions ||
      typeof navigator.permissions.query !== 'function'
    ) {
      setState('unsupported');
      return;
    }

    let isCancelled = false;
    let permissionStatus: PermissionStatus | null = null;

    const handleChange = (): void => {
      if (!isCancelled && permissionStatus) {
        setState(permissionStatus.state);
      }
    };

    const descriptor: PermissionDescriptor =
      typeof permission === 'string'
        ? ({ name: permission } as PermissionDescriptor)
        : (permission as unknown as PermissionDescriptor);

    setState('loading');

    navigator.permissions
      .query(descriptor)
      .then((status) => {
        if (isCancelled) {
          return;
        }
        permissionStatus = status;
        setState(status.state);
        status.addEventListener('change', handleChange);
      })
      .catch(() => {
        if (!isCancelled) {
          setState('unsupported');
        }
      });

    return () => {
      isCancelled = true;
      if (permissionStatus) {
        permissionStatus.removeEventListener('change', handleChange);
      }
    };
  }, [descriptorKey]);

  return state;
}
