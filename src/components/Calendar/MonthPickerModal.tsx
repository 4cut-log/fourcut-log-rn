import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
} from 'react-native';

const MONTHS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

interface MonthPickerModalProps {
  visible: boolean;
  currentYear: number;
  currentMonth: number; // 1-12
  onSelect: (year: number, month: number) => void;
  onClose: () => void;
}

export default function MonthPickerModal({
  visible,
  currentYear,
  currentMonth,
  onSelect,
  onClose,
}: MonthPickerModalProps) {
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const handlePrevYear = () => setSelectedYear(y => y - 1);
  const handleNextYear = () => setSelectedYear(y => y + 1);

  const handleMonthPress = (month: number) => {
    onSelect(selectedYear, month);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      {/* 바깥 영역 터치 시 닫기 */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
          {/* 연도 선택 */}
          <View style={styles.yearRow}>
            <TouchableOpacity onPress={handlePrevYear} hitSlop={12}>
              <Text style={styles.arrow}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.yearText}>{selectedYear}</Text>
            <TouchableOpacity onPress={handleNextYear} hitSlop={12}>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* 월 그리드 (3열 x 4행) */}
          <View style={styles.monthGrid}>
            {MONTHS.map((label, i) => {
              const month = i + 1;
              const isSelected =
                selectedYear === currentYear && month === currentMonth;
              return (
                <TouchableOpacity
                  key={month}
                  style={[styles.monthCell, isSelected && styles.selectedCell]}
                  onPress={() => handleMonthPress(month)}>
                  <Text
                    style={[
                      styles.monthText,
                      isSelected && styles.selectedText,
                    ]}>
                    {label}월
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheet: {
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: {width: 0, height: 8},
    shadowRadius: 16,
    elevation: 10,
  },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  arrow: {
    fontSize: 26,
    color: '#1a1a1a',
    lineHeight: 28,
  },
  yearText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  monthCell: {
    width: '30%',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  selectedCell: {
    backgroundColor: '#1a1a1a',
  },
  monthText: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '400',
  },
  selectedText: {
    color: '#fff',
    fontWeight: '600',
  },
});
