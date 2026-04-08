import {fetchFn} from '@hooks/useFetch';

export type FlogRequest = {
  photoUrl: string;
  thumbnailUrl: string;
  videoUrl?: string;
  date: string;
  location: string;
  memoCtt: string;
  tags: {tagName: string; color: string}[];
};

export type FlogResponse = {
  status: number;
  message: string;
  data: {
    flogId: string;
    userId: string;
    photoUrl: string;
    videoUrl?: string;
    date: string;
    location: string;
    memoCtt: string;
    tags: {tagId: string; tagName: string; color: string}[];
    createdAt: string;
  };
};

export const postFlog = (body: FlogRequest) =>
  fetchFn<FlogResponse>('post', '/flogs', body);

export const pinFlog = (flogId: string) =>
  fetchFn('put', `/flogs/${flogId}/pin`);

export const deleteFlog = (flogId: string) =>
  fetchFn('delete', `/flogs/${flogId}`);

export type FlogUpdateRequest = {
  photoUrl?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  date: string;
  location: string;
  memoCtt: string;
  tags: {tagName: string; color: string}[];
};

export const updateFlog = (flogId: string, body: FlogUpdateRequest) =>
  fetchFn<FlogResponse>('put', `/flogs/${flogId}`, body);
