import {useCallback} from 'react';
import {Alert, Linking} from 'react-native';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import Config from 'react-native-config';
import {mmkvStorage, KEY} from '@utils/storage';
import {postLogout} from '@api/index';

const BASE_URL = Config.BASE_URL;
const CALLBACK_SCHEME = 'fourcutlog://callback';

const useAuth = () => {
  /**
   * MMKV에서 토큰 가져오기
   */
  const getTokens = useCallback(() => {
    const accessToken = mmkvStorage.getString(KEY.ACCESS_TOKEN);
    const refreshToken = mmkvStorage.getString(KEY.REFRESH_TOKEN);
    return {accessToken, refreshToken};
  }, []);

  /**
   * 토큰 저장
   */
  const saveTokens = useCallback((accessToken: string, refreshToken: string) => {
    mmkvStorage.setString(KEY.ACCESS_TOKEN, accessToken);
    mmkvStorage.setString(KEY.REFRESH_TOKEN, refreshToken);
  }, []);

  /**
   * 토큰 삭제
   */
  const clearTokens = useCallback(() => {
    mmkvStorage.delete(KEY.ACCESS_TOKEN);
    mmkvStorage.delete(KEY.REFRESH_TOKEN);
  }, []);

  /**
   * 딥링크 콜백에서 토큰 파싱 후 저장
   */
  const handleCallback = useCallback(
    (url: string) => {
      const queryString = url.split('?')[1] ?? '';
      const params: Record<string, string> = {};
      queryString.split('&').forEach(pair => {
        const [key, value] = pair.split('=');
        if (key) {
          params[decodeURIComponent(key)] = decodeURIComponent(value ?? '');
        }
      });

      const accessToken = params['accessToken'];
      const refreshToken = params['refreshToken'];

      if (!accessToken || !refreshToken) {
        Alert.alert('로그인 실패', '토큰을 받지 못했습니다.');
        return false;
      }

      saveTokens(accessToken, refreshToken);
      return true;
    },
    [saveTokens],
  );

  /**
   * 로그아웃 (백엔드 Redis 삭제 + MMKV 삭제)
   */
  const logout = useCallback(async () => {
    try {
      await postLogout();
    } catch (error) {
      // 백엔드 실패해도 로컬 토큰은 무조건 삭제
    } finally {
      clearTokens();
    }
  }, [clearTokens]);

  /**
   * 소셜 로그인 (카카오 / 네이버)
   */
  const socialLogin = useCallback(
    async (provider: 'kakao' | 'naver') => {
      try {
        const url = `${BASE_URL}/oauth2/authorization/${provider}`;

        if (await InAppBrowser.isAvailable()) {
          const result = await InAppBrowser.openAuth(url, CALLBACK_SCHEME, {
            showTitle: false,
            enableUrlBarHiding: true,
            enableDefaultShare: false,
            ephemeralWebSession: true,
          });

          if (result.type === 'success' && result.url) {
            return handleCallback(result.url);
          }
        } else {
          Linking.openURL(url);
        }
      } catch (error: any) {
        Alert.alert('로그인 실패', error?.message ?? String(error));
      }
      return false;
    },
    [handleCallback],
  );

  return {
    getTokens,
    saveTokens,
    clearTokens,
    socialLogin,
    logout,
  };
};

export default useAuth;
