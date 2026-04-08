import {fetchFn} from '@hooks/useFetch';

export type GalleryFlogItem = {
  flogId: string;
  photoUrl: string;
  thumbnailUrl: string;
  date: string;
};

export type GalleryPageResponse = {
  status: number;
  message: string;
  data: {
    content: GalleryFlogItem[];
    hasNext: boolean;
    totalCount: number;
  };
};

export type TagDetailData = {
  tagName: string;
  color: string;
  count: number;
  firstDate: string;
  lastDate: string;
};

export type TagDetailResponse = {
  status: number;
  message: string;
  data: TagDetailData;
};

export const getGalleryRecent = (page: number, size = 21) =>
  fetchFn<GalleryPageResponse>('get', '/flogs/gallery', {page, size});

export const getGalleryByTag = (tagName: string, page: number, size = 21) =>
  fetchFn<GalleryPageResponse>('get', '/flogs/gallery/tag', {tagName, page, size});

export const getTagDetail = (tagName: string) =>
  fetchFn<TagDetailResponse>('get', `/tags/${encodeURIComponent(tagName)}`);

export const deleteTag = (tagName: string) =>
  fetchFn('delete', `/tags/${encodeURIComponent(tagName)}`);
