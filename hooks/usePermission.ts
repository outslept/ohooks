import { useEffect, useState } from 'react';
import { useLatest } from './useLatest';

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
  /** Name of the browser permission to query */
  name: ExtendedPermissionName;
  /** Additional descriptor properties required by specific permissions (e.g., `userVisibleOnly`, `sysex`) */
  [key: string]: unknown;
}

export type UsePermissionState = PermissionState | 'loading' | 'unsupported';

function isPermissionsSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    Boolean(navigator.permissions) &&
    typeof navigator.permissions.query === 'function'
  );
}

/**
 * Queries and subscribes to browser permission status changes via `navigator.permissions.query`.
 *
 * @category Browser
 * @param permission - Permission name string (e.g., `'camera'`, `'geolocation'`) or `PermissionDescriptor` object
 * @returns Current permission status (`'granted'`, `'denied'`, `'prompt'`, `'loading'`, or `'unsupported'`)
 *
 * @example
 * ```tsx
 * const cameraPermission = usePermission('camera');
 * ```
 */
export function usePermission(
  permission: ExtendedPermissionName | ExtendedPermissionDescriptor,
): UsePermissionState {
  const isSupported = isPermissionsSupported();

  const [state, setState] = useState<UsePermissionState>(() =>
    isSupported ? 'loading' : 'unsupported',
  );

  const permissionRef = useLatest(permission);

  const descriptorKey =
    typeof permission === 'string'
      ? permission
      : JSON.stringify(permission);

  const [prevDescriptorKey, setPrevDescriptorKey] = useState(descriptorKey);
  if (prevDescriptorKey !== descriptorKey) {
    setPrevDescriptorKey(descriptorKey);
    setState(isSupported ? 'loading' : 'unsupported');
  }

  useEffect(() => {
    if (
      typeof navigator === 'undefined' ||
      !navigator.permissions ||
      typeof navigator.permissions.query !== 'function'
    ) {
      return;
    }

    let isCancelled = false;
    let permissionStatus: PermissionStatus | null = null;

    const handleChange = (): void => {
      if (!isCancelled && permissionStatus) {
        setState(permissionStatus.state);
      }
    };

    const currentPermission = permissionRef.current;
    const descriptor: PermissionDescriptor =
      typeof currentPermission === 'string'
        ? ({ name: currentPermission } as PermissionDescriptor)
        : (currentPermission as unknown as PermissionDescriptor);

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
  }, [descriptorKey, permissionRef]);

  return state;
}
