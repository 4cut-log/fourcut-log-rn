import {fetchFn} from '@hooks/useFetch';

export interface TagItem {
  tagName: string;
  color: string;
  count: number;
  thumbnailUrl?: string;
}

export const getTags = () =>
  fetchFn<{status: number; data: TagItem[]; message: string}>('get', '/tags');
