import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import {CalendarPhoto} from '@type/calendar';

const SCREEN_WIDTH = Dimensions.get('window').width;
const ITEM_SIZE = (SCREEN_WIDTH - 48) / 3;

interface DayBottomSheetProps {
  visible: boolean;
  date: string;
  photos: CalendarPhoto[];
  onSelect: (flogId: number) => void;
  onPin: (flogId: number) => void;
  onClose: () => void;
}

export default function DayBottomSheet({
  visible,
  date,
  photos,
  onSelect,
  onPin,
  onClose,
}: DayBottomSheetProps) {
  const [, month, day] = date.split('-');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      {/* 전체 컨테이너 — 바텀에 sheet 정렬 */}
      <View style={styles.container}>
        {/* 딤 배경 */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* 바텀시트 */}
        <View style={styles.sheet}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {parseInt(month, 10)}월 {parseInt(day, 10)}일 네컷 기록
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* 안내 문구 */}
          <Text style={styles.guide}>별을 눌러서 대표 사진을 정해보세요!</Text>

          {/* 썸네일 그리드 */}
          <FlatList
            data={photos}
            keyExtractor={item => String(item.id)}
            numColumns={3}
            contentContainerStyle={styles.grid}
            columnWrapperStyle={styles.row}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => onSelect(item.id)}
                activeOpacity={0.8}>
                <Image
                  source={{uri: item.thumbnailUrl}}
                  style={styles.thumbnail}
                />
                {/* 별 버튼 — 대표 썸네일 지정 */}
                <TouchableOpacity
                  style={[styles.pinBtn, item.pinned && styles.pinBtnActive]}
                  onPress={() => onPin(item.id)}
                  hitSlop={8}>
                  <Text style={[styles.pinIcon, item.pinned && styles.pinIconActive]}>
                    {item.pinned ? '★' : '☆'}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingBottom: 40,
    maxHeight: '65%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  closeBtn: {
    fontSize: 18,
    color: '#888',
  },
  guide: {
    fontSize: 14,
    color: '#AAA',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  grid: {
    padding: 12,
  },
  row: {
    gap: 6,
    marginBottom: 6,
  },
  item: {
    width: ITEM_SIZE,
    height: ITEM_SIZE * 1.4,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  pinBtn: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinBtnActive: {
    backgroundColor: '#F5A623',
  },
  pinIcon: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  pinIconActive: {
    color: '#fff',
  },
});
