import api from './axiosInstance';

/**
 * 로그아웃
 * Access Token을 헤더에 담아 서버 측 Refresh Token 삭제
 */
export const postLogout = () => api.post('/auth/logout');

/**
 * 토큰 재발급
 * Refresh Token으로 새 Access/Refresh Token 발급
 * (axiosInstance 인터셉터에서 자동 호출되므로 직접 호출할 일은 거의 없음)
 */
export const postReissue = (refreshToken: string) =>
  api.post('/auth/reissue', null, {
    headers: {'Refresh-Token': refreshToken},
  });
