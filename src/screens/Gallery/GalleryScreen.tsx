import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {GalleryStackParamList} from '@type/navigation';
import {_useFetch} from '@hooks/useFetch';
import {TagItem} from '@api/tags';
import {GalleryPageResponse} from '@api/gallery';
import {scaleFont, scaleHeight, scaleWidth, textStyle} from '@css/scale';

const SCREEN_WIDTH = Dimensions.get('window').width;
const LARGE_THUMB_W = Math.round(SCREEN_WIDTH * 0.42);
const LARGE_THUMB_H = Math.round(LARGE_THUMB_W * 1.33);

type Nav = NativeStackNavigationProp<GalleryStackParamList>;

export default function GalleryScreen() {
  const navigation = useNavigation<Nav>();

  const {data: recentRes, isLoading: recentLoading} =
    _useFetch<GalleryPageResponse>('/flogs/gallery', ['gallery', 'recent', 0], {
      page: 0,
      size: 6,
    });

  const {data: tagsRes, isLoading: tagsLoading} = _useFetch<{
    status: number;
    data: TagItem[];
    message: string;
  }>('/tags', ['tags']);

  const recentItems = recentRes?.data?.content ?? [];
  const totalCount = recentRes?.data?.totalCount ?? 0;
  const tags = tagsRes?.data ?? [];
  const isEmpty = !recentLoading && !tagsLoading && totalCount === 0;

  if (recentLoading || tagsLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>갤러리</Text>
        </View>
        <ActivityIndicator style={{flex: 1}} color="#111" />
      </SafeAreaView>
    );
  }

  if (isEmpty) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>갤러리</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🌱</Text>
          <Text style={styles.emptyTitle}>아직 쌓인 네컷로그가 없어요</Text>
          <Text style={styles.emptyDesc}>
            {'함께 찍은 사람별로, 일자순으로\n네컷사진을 정리할 수 있어요'}
          </Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => navigation.getParent()?.navigate('AddLog' as any)}>
            <Text style={styles.emptyBtnText}>기록 추가하기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 최신순 섹션 */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => navigation.navigate('GalleryRecent')}
          activeOpacity={0.7}>
          <View style={styles.sectionMeta}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>최신순</Text>
              <Text style={styles.sectionArrow}>›</Text>
            </View>
            <Text style={styles.sectionSub}>{totalCount}개의 기록</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photoScrollContent}>
            {recentItems.slice(0, 3).map(item => (
              <Image
                key={item.flogId}
                source={{uri: item.photoUrl}}
                style={styles.largeThumb}
              />
            ))}
          </ScrollView>
        </TouchableOpacity>

        {/* 인물별 섹션 */}
        {tags.length > 0 && (
          <TouchableOpacity
            style={styles.section}
            onPress={() => navigation.navigate('GalleryByTag')}
            activeOpacity={0.7}>
            <View style={styles.sectionMeta}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>인물별</Text>
                <Text style={styles.sectionArrow}>›</Text>
              </View>
              <Text style={styles.sectionSub}>{tags.length}명의 사람들</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photoScrollContent}>
              {tags.slice(0, 3).map(tag => (
                <View key={tag.tagName} style={styles.tagLargeCard}>
                  {tag.thumbnailUrl ? (
                    <Image
                      source={{uri: tag.thumbnailUrl}}
                      style={styles.largeThumb}
                    />
                  ) : (
                    <View
                      style={[styles.largeThumb, {backgroundColor: tag.color}]}
                    />
                  )}
                  <View style={styles.tagLargeLabel}>
                    <Text style={styles.tagLargeName} numberOfLines={1}>
                      {tag.tagName}
                    </Text>
                    <Text style={styles.tagLargeCount}>{tag.count}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  header: {
    paddingHorizontal: scaleWidth(20),
    paddingVertical: scaleHeight(16),
  },
  headerTitle: {
    ...textStyle({fontSize: scaleFont(26), fontWeight: '700', color: '#111'}),
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scaleWidth(40),
    gap: scaleHeight(8),
  },
  emptyIcon: {fontSize: scaleFont(42)},
  emptyTitle: {
    ...textStyle({fontSize: scaleFont(19), fontWeight: '600', color: '#111'}),
    marginTop: scaleHeight(8),
  },
  emptyDesc: {
    ...textStyle({fontSize: scaleFont(16), color: '#888'}),
    textAlign: 'center',
    lineHeight: scaleFont(24),
  },
  emptyBtn: {
    marginTop: scaleHeight(20),
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: scaleWidth(20),
    paddingHorizontal: scaleWidth(24),
    paddingVertical: scaleHeight(12),
  },
  emptyBtnText: {
    ...textStyle({fontSize: scaleFont(18), color: '#333'}),
  },
  section: {
    paddingTop: scaleHeight(24),
    paddingBottom: scaleHeight(8),
  },
  sectionMeta: {
    paddingHorizontal: scaleWidth(20),
    marginBottom: scaleHeight(12),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleWidth(4),
  },
  sectionTitle: {
    ...textStyle({fontSize: scaleFont(22), fontWeight: '700', color: '#111'}),
  },
  sectionArrow: {
    fontSize: scaleFont(26),
    color: '#111',
    marginTop: -scaleHeight(1),
  },
  sectionSub: {
    ...textStyle({fontSize: scaleFont(15), color: '#999'}),
    marginTop: scaleHeight(3),
  },
  photoScrollContent: {
    paddingHorizontal: scaleWidth(20),
    gap: scaleWidth(10),
  },
  largeThumb: {
    width: LARGE_THUMB_W,
    height: LARGE_THUMB_H,
    borderRadius: scaleWidth(8),
    backgroundColor: '#f0f0f0',
  },
  tagLargeCard: {
    width: LARGE_THUMB_W,
    height: LARGE_THUMB_H,
    borderRadius: scaleWidth(8),
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  tagLargeLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: scaleWidth(6),
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: scaleWidth(10),
    paddingVertical: scaleHeight(8),
  },
  tagLargeName: {
    ...textStyle({fontSize: scaleFont(16), fontWeight: '600', color: '#fff'}),
  },
  tagLargeCount: {
    ...textStyle({fontSize: scaleFont(14), color: 'rgba(255,255,255,0.85)'}),
  },
});
