import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import {AxiosError} from 'axios';
import api from '@api/axiosInstance';

type TMethod = 'get' | 'post' | 'put' | 'delete';

/**
 * axios 호출 공통 함수
 */
export const fetchFn = async <T,>(
  method: TMethod,
  url: string,
  param?: any,
): Promise<T> => {
  switch (method) {
    case 'get':
      return api.get<T>(url, {params: param}).then(res => res.data as T);
    case 'post':
      return api.post<T>(url, param).then(res => res.data as T);
    case 'put':
      return api.put<T>(url, param).then(res => res.data as T);
    case 'delete':
      return api.delete<T>(url, {data: param}).then(res => res.data as T);
    default:
      throw new Error(`no fetch info method:${method} url:${url}`);
  }
};

/**
 * GET 요청 훅
 * @example
 * const {data, isPending, isError} = _useFetch('/calendar', ['calendar', userId])
 */
export const _useFetch = <TData = any, TError = AxiosError>(
  url: string,
  queryKey: Array<unknown>,
  params?: any,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery<TData, TError>({
    queryKey,
    queryFn: () => fetchFn<TData>('get', url, params),
    ...options,
  });
};

/**
 * POST/PUT/DELETE 요청 훅 (파라미터 고정)
 * @example
 * const {mutate} = _useFetchMute('post', '/auth/logout')
 * mutate()
 */
export const _useFetchMute = <
  TData = any,
  TVariables = void,
  TError = AxiosError,
>(
  method: Exclude<TMethod, 'get'>,
  url: string,
  param?: any,
  options?: UseMutationOptions<TData, TError, TVariables>,
) => {
  return useMutation<TData, TError, TVariables>({
    mutationFn: () => fetchFn<TData>(method, url, param),
    ...options,
  });
};

/**
 * POST/PUT/DELETE 요청 훅 (호출 시 파라미터 전달)
 * @example
 * const {mutate} = _useFetchMuteParam<ResponseType, RequestType>('post', '/calendar')
 * mutate({title: '네컷', date: '2024-01-01'})
 */
export const _useFetchMuteParam = <
  TData = any,
  TVariables = void,
  TError = AxiosError,
>(
  method: Exclude<TMethod, 'get'>,
  url: string,
  options?: UseMutationOptions<TData, TError, TVariables>,
) => {
  return useMutation<TData, TError, TVariables>({
    mutationFn: (param: TVariables) => fetchFn<TData>(method, url, param),
    ...options,
  });
};

export default _useFetch;
