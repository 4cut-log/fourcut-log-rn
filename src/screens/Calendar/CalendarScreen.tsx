import React, {useState, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Calendar, DateData} from 'react-native-calendars';
import {_useFetch} from '@hooks/useFetch';
import {DayCell, DayBottomSheet} from '@components';
import MonthPickerModal from '@/components/Calendar/MonthPickerModal';
import {PhotosByDate, CalendarPhoto, CalendarDayData} from '@type/calendar';
import type {DayState} from 'react-native-calendars/src/types';
import {useNavigation} from '@react-navigation/native';
import type {NavigationProp} from '@react-navigation/native';
import {RootStackParamList} from '@type/navigation';
import {pinFlog} from '@api/flog';
import {useQueryClient} from '@tanstack/react-query';
import {TagItem} from '@api/tags';
import TagFilterModal from '@/components/Calendar/TagFilterModal';

const toYearMonth = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const TODAY = new Date().toISOString().split('T')[0];
const TODAY_MONTH = TODAY.substring(0, 7);

export default function CalendarScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(toYearMonth(new Date()));
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [selectedTagNames, setSelectedTagNames] = useState<string[]>([]);
  const [bottomSheet, setBottomSheet] = useState<{
    visible: boolean;
    date: string;
    photos: CalendarPhoto[];
  }>({visible: false, date: '', photos: []});

  const {data: tagsRes} = _useFetch<{status: number; data: TagItem[]; message: string}>(
    '/tags',
    ['tags'],
    undefined,
    {retry: false},
  );
  const tags: TagItem[] = tagsRes?.data ?? [];

  const calendarParams = useMemo(
    () => ({
      yearMonth: currentMonth,
      ...(selectedTagNames.length > 0 ? {tagNames: selectedTagNames.join(',')} : {}),
    }),
    [currentMonth, selectedTagNames],
  );

  const {data: calendarRes, isLoading} = _useFetch<{
    status: number;
    data: CalendarDayData[];
    message: string;
  }>('/calendar', ['calendar', currentMonth, selectedTagNames], calendarParams, {
    retry: false,
  });

  const photosByDate: PhotosByDate = useMemo(() => {
    if (!calendarRes?.data) return {};
    const result: PhotosByDate = {};
    calendarRes.data.forEach(({date, photos}) => {
      result[date] = photos;
    });
    return result;
  }, [calendarRes]);

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
        <TouchableOpacity
          style={styles.menuButton}
          hitSlop={8}
          onPress={() => setIsFilterVisible(true)}>
          <Text style={styles.menuIcon}>☰</Text>
          {selectedTagNames.length > 0 && <View style={styles.filterDot} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.monthPicker}
          hitSlop={8}
          onPress={() => setIsPickerVisible(true)}>
          <Text style={styles.monthText}>
            {yearStr}.{parseInt(monthStr, 10)}
          </Text>
          <Image source={require('@images/calendar/downArrowIcon.png')} style={styles.downArrowIcon} />
        </TouchableOpacity>
        <View style={styles.headerRight} />
      </View>

      {/* 캘린더 */}
      {isLoading ? (
        <ActivityIndicator style={styles.loader} color="#F5A623" />
      ) : null}
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
              onPress={(dateString, photos) => {
                if (photos.length === 0) return;
                if (photos.length === 1) {
                  navigation.navigate('FlogDetail', {
                    flogId: String(photos[0].id),
                  });
                } else {
                  setBottomSheet({visible: true, date: dateString, photos});
                }
              }}
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

      {/* 날짜 바텀시트 (기록 여러 개일 때) */}
      <DayBottomSheet
        visible={bottomSheet.visible}
        date={bottomSheet.date}
        photos={bottomSheet.photos}
        onSelect={flogId => {
          setBottomSheet(prev => ({...prev, visible: false}));
          navigation.navigate('FlogDetail', {flogId: String(flogId)});
        }}
        onPin={async flogId => {
          await pinFlog(String(flogId));
          // 캘린더 데이터 갱신 + 바텀시트 내 pinned 상태 업데이트
          queryClient.invalidateQueries({queryKey: ['calendar', currentMonth]});
          setBottomSheet(prev => ({
            ...prev,
            photos: prev.photos.map(p => ({...p, pinned: p.id === flogId})),
          }));
        }}
        onClose={() => setBottomSheet(prev => ({...prev, visible: false}))}
      />

      {/* 태그 필터 모달 */}
      <TagFilterModal
        visible={isFilterVisible}
        tags={tags}
        selectedTagNames={selectedTagNames}
        onToggle={tagName =>
          setSelectedTagNames(prev =>
            prev.includes(tagName)
              ? prev.filter(t => t !== tagName)
              : [...prev, tagName],
          )
        }
        onSelectAll={() => setSelectedTagNames(tags.map(t => t.tagName))}
        onClearAll={() => setSelectedTagNames([])}
        onClose={() => setIsFilterVisible(false)}
      />

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
  filterDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#F5A623',
  },
  menuIcon: {
    fontSize: 22,
    color: '#1a1a1a',
  },
  monthPicker: {
    marginLeft: 8,
    padding: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  monthText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  downArrowIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  headerRight: {
    flex: 1,
  },
  calendar: {
    paddingHorizontal: 16,
  },
  loader: {
    position: 'absolute',
    alignSelf: 'center',
    top: '50%',
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
    fontSize: 16,
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
    fontSize: 30,
    color: '#fff',
    lineHeight: 32,
    fontWeight: '300',
  },
});
