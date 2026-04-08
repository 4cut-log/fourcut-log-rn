import {fetchFn} from '@hooks/useFetch';

export interface UserProfile {
  nickname: string;
  email: string;
}

export const getUserProfile = () =>
  fetchFn<{status: number; data: UserProfile; message: string}>('get', '/users/me');

export const updateNickname = (nickname: string) =>
  fetchFn<{status: number; data: null; message: string}>('put', '/users/me', {nickname});

export const deleteAccount = () =>
  fetchFn<{status: number; data: null; message: string}>('delete', '/users/me');
