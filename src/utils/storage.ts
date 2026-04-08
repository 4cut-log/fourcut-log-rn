import {MMKV} from 'react-native-mmkv';

const storage = new MMKV();

const KEY = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  NICKNAME: 'nickname',
};

const mmkvStorage = {
  getString: (key: string): string | undefined => storage.getString(key),
  setString: (key: string, value: string): void => storage.set(key, value),
  delete: (key: string): void => storage.delete(key),
};

export {mmkvStorage, KEY};
