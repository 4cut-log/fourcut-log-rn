import React, {useEffect, useRef} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {scaleFont, scaleHeight, scaleWidth, textStyle} from '@css/scale';
import {TagItem} from '@api/tags';

const DRAWER_WIDTH = Dimensions.get('window').width * 0.62;

interface Props {
  visible: boolean;
  tags: TagItem[];
  selectedTagNames: string[];
  onToggle: (tagName: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onClose: () => void;
}

export default function TagFilterModal({
  visible,
  tags,
  selectedTagNames,
  onToggle,
  onSelectAll,
  onClearAll,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -DRAWER_WIDTH,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}>
      {/* 우측 딤 영역 터치 시 닫기 */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, {opacity: overlayOpacity}]} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.drawer,
          {
            paddingTop: insets.top + scaleHeight(16),
            paddingBottom: insets.bottom + scaleHeight(16),
            transform: [{translateX}],
          },
        ]}>
        <Text style={styles.title}>인물 필터</Text>

        {tags.length === 0 ? (
          <Text style={styles.empty}>등록된 인물이 아직 없습니다</Text>
        ) : (
          <>
            <View style={styles.actions}>
              <TouchableOpacity onPress={onSelectAll}>
                <Text style={styles.actionText}>전체 선택</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClearAll}>
                <Text style={styles.actionText}>전체 해제</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {tags.map(tag => {
                const selected = selectedTagNames.includes(tag.tagName);
                return (
                  <TouchableOpacity
                    key={tag.tagName}
                    style={styles.row}
                    onPress={() => onToggle(tag.tagName)}
                    activeOpacity={0.7}>
                    <View
                      style={[
                        styles.checkbox,
                        {
                          backgroundColor: selected ? tag.color : '#fff',
                          borderColor: tag.color,
                        },
                      ]}
                    />
                    <Text style={styles.tagName}>{tag.tagName}</Text>
                    <Text style={styles.count}>{tag.count}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        )}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#fff',
    paddingHorizontal: scaleWidth(20),
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: {width: 4, height: 0},
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    ...textStyle({fontSize: scaleFont(20), fontWeight: '700', color: '#111'}),
    marginBottom: scaleHeight(16),
  },
  empty: {
    ...textStyle({fontSize: scaleFont(15), color: '#999'}),
    marginTop: scaleHeight(4),
  },
  actions: {
    flexDirection: 'row',
    gap: scaleWidth(16),
    marginBottom: scaleHeight(8),
  },
  actionText: {
    ...textStyle({fontSize: scaleFont(15), color: '#555'}),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scaleHeight(12),
  },
  checkbox: {
    width: scaleWidth(20),
    height: scaleWidth(20),
    borderRadius: scaleWidth(4),
    borderWidth: 1.5,
    borderColor: '#ccc',
    marginRight: scaleWidth(10),
  },
  tagName: {
    ...textStyle({fontSize: scaleFont(16), color: '#222'}),
    flex: 1,
  },
  count: {
    ...textStyle({fontSize: scaleFont(15), color: '#aaa'}),
  },
});
