import {NavigatorScreenParams} from '@react-navigation/native';

// ────────────────────────────────
// Root Stack
// ────────────────────────────────
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  BottomTab: NavigatorScreenParams<RootBottomTabParamList>;
  AddLog: undefined;
  FlogDetail: {flogId: string};
  EditLog: {flogId: string};
};

// ────────────────────────────────
// Bottom Tab
// ────────────────────────────────
export type RootBottomTabParamList = {
  CalendarTab: undefined;
  GalleryTab: undefined;
  MoreTab: undefined;
};

// ────────────────────────────────
// Auth Stack
// ────────────────────────────────
export type AuthStackParamList = {
  Login: undefined;
};

// ────────────────────────────────
// Calendar Stack
// ────────────────────────────────
export type CalendarStackParamList = {
  CalendarMain: undefined;
  // 예: CalendarDetail: { date: string };
};

// ────────────────────────────────
// Gallery Stack
// ────────────────────────────────
export type GalleryStackParamList = {
  GalleryMain: undefined;
  GalleryRecent: undefined;
  GalleryByTag: undefined;
  GalleryTagDetail: {tagName: string; color: string};
};

// ────────────────────────────────
// More Stack
// ────────────────────────────────
export type MoreStackParamList = {
  MoreMain: undefined;
  EditProfile: undefined;
};
