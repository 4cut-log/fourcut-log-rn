import {fetchFn} from '@hooks/useFetch';

export interface AppVersionInfo {
  latestVersion: string;
  minRequiredVersion: string;
  iosStoreUrl: string;
  aosStoreUrl: string;
}

export const getAppVersion = () =>
  fetchFn<{status: number; data: AppVersionInfo; message: string}>(
    'get',
    '/app/version',
  );

export const APP_CURRENT_VERSION = '1.0.0';

export const isVersionLower = (v1: string, v2: string): boolean => {
  const p1 = v1.split('.').map(Number);
  const p2 = v2.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((p1[i] || 0) < (p2[i] || 0)) return true;
    if ((p1[i] || 0) > (p2[i] || 0)) return false;
  }
  return false;
};
