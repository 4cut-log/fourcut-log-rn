import {fetchFn} from '@hooks/useFetch';
import {CalendarDayData} from '@type/calendar';

export const getCalendarPhotos = (yearMonth: string, tagNames?: string[]) =>
  fetchFn<{status: number; data: CalendarDayData[]; message: string}>(
    'get',
    '/calendar',
    {
      yearMonth,
      ...(tagNames && tagNames.length > 0 ? {tagNames: tagNames.join(',')} : {}),
    },
  );
