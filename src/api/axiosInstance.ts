import axios, {AxiosError} from 'axios';
import Config from 'react-native-config';
import {mmkvStorage, KEY} from '@utils/storage';

const instance = axios.create({
  baseURL: Config.BASE_URL,
  headers: {'Content-Type': 'application/json'},
});

/**
 * 요청 인터셉터: Access Token 자동 첨부
 */
instance.interceptors.request.use(config => {
  const accessToken = mmkvStorage.getString(KEY.ACCESS_TOKEN);
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

/**
 * 응답 인터셉터: 401 시 Refresh Token으로 재발급 후 재요청
 */
instance.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // 401이고 재시도 안 한 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = mmkvStorage.getString(KEY.REFRESH_TOKEN);
      if (!refreshToken) {
        return Promise.reject(error);
      }

      try {
        // Refresh Token으로 새 토큰 발급
        const res = await instance.post('/auth/reissue', null, {
          headers: {'Refresh-Token': refreshToken},
        });

        const {accessToken: newAccessToken, refreshToken: newRefreshToken} =
          res.data.data;

        // 새 토큰 저장
        mmkvStorage.setString(KEY.ACCESS_TOKEN, newAccessToken);
        mmkvStorage.setString(KEY.REFRESH_TOKEN, newRefreshToken);

        // 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return instance(originalRequest);
      } catch {
        // Refresh Token도 만료 → 토큰 삭제 (로그인 화면으로 이동은 각 화면에서 처리)
        mmkvStorage.delete(KEY.ACCESS_TOKEN);
        mmkvStorage.delete(KEY.REFRESH_TOKEN);
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default instance;
