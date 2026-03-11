import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Calendar, DateData} from 'react-native-calendars';
import {useQuery} from '@tanstack/react-query';
import {getCalendarPhotos} from '@api/calendar';
import {DayCell} from '@components';
import MonthPickerModal from '@/components/Calendar/MonthPickerModal';
import {PhotosByDate} from '@type/calendar';
import type {DayState} from 'react-native-calendars/src/types';
import {useNavigation} from '@react-navigation/native';
import type {NavigationProp} from '@react-navigation/native';
import {RootStackParamList} from '@type/navigation';

const toYearMonth = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const TODAY = new Date().toISOString().split('T')[0];
const TODAY_MONTH = TODAY.substring(0, 7);

export default function CalendarScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [currentMonth, setCurrentMonth] = useState(toYearMonth(new Date()));
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  const {data: photosByDate = {}, isLoading} = useQuery<PhotosByDate>({
    queryKey: ['calendar', currentMonth],
    queryFn: async () => {
      const res = await getCalendarPhotos(currentMonth);
      const result: PhotosByDate = {};
      res.data.data.forEach(({date, photos}) => {
        result[date] = photos;
      });
      return result;
    },
  });

  const handleMonthChange = useCallback((month: DateData) => {
    setCurrentMonth(`${month.year}-${String(month.month).padStart(2, '0')}`);
  }, []);

  const handlePickerSelect = useCallback((year: number, month: number) => {
    setCurrentMonth(`${year}-${String(month).padStart(2, '0')}`);
  }, []);

  const goToToday = useCallback(() => {
    setCurrentMonth(TODAY_MONTH);
  }, []);

  const [yearStr, monthStr] = currentMonth.split('-');
  const isCurrentMonth = currentMonth === TODAY_MONTH;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} hitSlop={8}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.monthPicker}
          hitSlop={8}
          onPress={() => setIsPickerVisible(true)}>
          <Text style={styles.monthText}>
            {yearStr}.{parseInt(monthStr, 10)} ∨
          </Text>
        </TouchableOpacity>
        <View style={styles.headerRight} />
      </View>

      {/* 캘린더 */}
      {isLoading ? (
        <ActivityIndicator style={styles.loader} color="#F5A623" />
      ) : (
        <Calendar
          key={currentMonth}
          current={`${currentMonth}-01`}
          firstDay={0}
          hideArrows
          renderHeader={() => null}
          disableMonthChange
          onMonthChange={handleMonthChange}
          dayComponent={({date, state}) => {
            if (!date) {
              return null;
            }
            const photos = photosByDate[date.dateString] ?? [];
            const dow = new Date(`${date.dateString}T00:00:00`).getDay();
            return (
              <DayCell
                date={date}
                state={state as DayState | undefined}
                photos={photos}
                dayOfWeek={dow}
                onPress={dateString => console.log('날짜 선택:', dateString)}
              />
            );
          }}
          style={styles.calendar}
          theme={{
            textDayHeaderFontSize: 13,
            textSectionTitleColor: '#666',
            calendarBackground: '#fff',
          }}
        />
      )}

      {/* 오늘로 이동 버튼 (현재 월이 아닐 때만) */}
      {!isCurrentMonth && (
        <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
          <Text style={styles.todayButtonText}>오늘 ›</Text>
        </TouchableOpacity>
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddLog')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* 월 선택 모달 */}
      <MonthPickerModal
        visible={isPickerVisible}
        currentYear={parseInt(yearStr, 10)}
        currentMonth={parseInt(monthStr, 10)}
        onSelect={handlePickerSelect}
        onClose={() => setIsPickerVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuButton: {
    padding: 4,
  },
  menuIcon: {
    fontSize: 20,
    color: '#1a1a1a',
  },
  monthPicker: {
    marginLeft: 8,
    padding: 4,
  },
  monthText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  headerRight: {
    flex: 1,
  },
  calendar: {
    paddingHorizontal: 16,
  },
  loader: {
    flex: 1,
  },
  todayButton: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 3,
  },
  todayButtonText: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    fontSize: 28,
    color: '#fff',
    lineHeight: 32,
    fontWeight: '300',
  },
});
