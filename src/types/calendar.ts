export interface CalendarPhoto {
  id: number;
  thumbnailUrl: string;
  pinned: boolean;
}

export interface CalendarDayData {
  date: string; // 'YYYY-MM-DD'
  photos: CalendarPhoto[];
}

export type PhotosByDate = Record<string, CalendarPhoto[]>;
