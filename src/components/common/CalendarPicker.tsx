import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Calendar, DateData} from 'react-native-calendars';
import {scaleFont, textStyle} from '@css/scale';

const SUN = '#E0494B';
const SAT = '#3478F6';
const NORMAL = '#111';
const DISABLED = '#C8C8C8';

interface Props {
  current: string;
  maxDate: string;
  selectedDate: string;
  onDayPress: (dateString: string) => void;
}

export default function CalendarPicker({current, maxDate, selectedDate, onDayPress}: Props) {
  return (
    <Calendar
      current={current}
      maxDate={maxDate}
      monthFormat="yyyy년 M월"
      markedDates={{
        [selectedDate]: {selected: true, selectedColor: NORMAL},
      }}
      onDayPress={(day: DateData) => onDayPress(day.dateString)}
      dayComponent={({date, state, marking, onPress}: any) => {
        const dow = new Date(date.dateString).getDay();
        const isDisabled = state === 'disabled';
        const isSelected = marking?.selected;

        let color = NORMAL;
        if (isDisabled) color = DISABLED;
        else if (dow === 0) color = SUN;
        else if (dow === 6) color = SAT;

        return (
          <TouchableOpacity
            onPress={() => !isDisabled && onPress(date)}
            activeOpacity={0.7}
            style={styles.dayCell}>
            <View style={[styles.dayInner, isSelected && styles.selectedDay]}>
              <Text style={[styles.dayText, {color: isSelected ? '#fff' : color}]}>
                {date.day}
              </Text>
            </View>
          </TouchableOpacity>
        );
      }}
      theme={{
        todayTextColor: '#3478F6',
        arrowColor: NORMAL,
        textMonthFontSize: scaleFont(17),
        textMonthFontWeight: '600',
        stylesheet: {
          calendar: {
            header: {
              dayTextAtIndex0: {color: SUN},
              dayTextAtIndex6: {color: SAT},
            },
          },
        },
      }}
    />
  );
}

const styles = StyleSheet.create({
  dayCell: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDay: {
    backgroundColor: NORMAL,
  },
  dayText: {
    ...textStyle({fontSize: scaleFont(16)}),
  },
});
