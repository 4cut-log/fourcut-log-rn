import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {CalendarPhoto} from '@type/calendar';
import type {DayState} from 'react-native-calendars/src/types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CELL_SIZE = (SCREEN_WIDTH - 32) / 7; // 좌우 padding 16px 기준
const THUMB_WIDTH = CELL_SIZE - 4;
const THUMB_HEIGHT = THUMB_WIDTH * (4 / 3); // 3:4 비율

interface DayCellProps {
  date: {dateString: string; day: number; month: number; year: number};
  state?: DayState;
  photos: CalendarPhoto[];
  dayOfWeek: number; // 0=일, 1=월 ... 6=토
  onPress: (dateString: string, photos: CalendarPhoto[]) => void;
}

export default function DayCell({
  date,
  state,
  photos,
  dayOfWeek,
  onPress,
}: DayCellProps) {
  const isToday = state === 'today';
  const isDisabled = state === 'disabled';
  const isSunday = dayOfWeek === 0;
  const isSaturday = dayOfWeek === 6;

  const textColor = isDisabled
    ? '#ccc'
    : isSunday
    ? '#FF3B30'
    : isSaturday
    ? '#007AFF'
    : '#1a1a1a';

  const photo = photos[0] ?? null;

  return (
    <TouchableOpacity
      onPress={() => !isDisabled && onPress(date.dateString, photos)}
      activeOpacity={0.7}
      style={[styles.cell, {width: CELL_SIZE}]}>
      {/* 날짜 숫자 - 항상 상단에 표시 */}
      <View style={[styles.dayWrapper, isToday && styles.todayBorder]}>
        <Text style={[styles.dayText, {color: textColor}]}>{date.day}</Text>
      </View>
      {/* 썸네일 - 사진이 있을 때만 날짜 아래에 표시 */}
      {photo && (
        <Image
          source={{uri: photo.thumbnailUrl}}
          style={styles.thumbnail}
          resizeMode="cover"
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cell: {
    alignItems: 'center',
    paddingVertical: 4,
    minHeight: THUMB_HEIGHT + 32,
    gap: 2,
  },
  dayWrapper: {
    width: 28,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 2,
  },
  todayBorder: {
    borderWidth: 1.5,
    borderColor: '#F5A623',
  },
  dayText: {
    fontSize: 15,
    fontWeight: '400',
  },
  thumbnail: {
    width: THUMB_WIDTH,
    height: THUMB_HEIGHT,
    borderRadius: 3,
  },
});
