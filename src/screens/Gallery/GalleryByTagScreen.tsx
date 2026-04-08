import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {GalleryStackParamList} from '@type/navigation';
import {_useFetch} from '@hooks/useFetch';
import {TagItem} from '@api/tags';
import {scaleFont, scaleHeight, scaleWidth, textStyle} from '@css/scale';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GAP = scaleWidth(4);
const CARD_SIZE = (SCREEN_WIDTH - scaleWidth(40) - GAP * 2) / 3;

type Nav = NativeStackNavigationProp<GalleryStackParamList>;

export default function GalleryByTagScreen() {
  const navigation = useNavigation<Nav>();

  const {data: tagsRes, isLoading} = _useFetch<{
    status: number;
    data: TagItem[];
    message: string;
  }>('/tags', ['tags']);

  const tags = tagsRes?.data ?? [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <Image
            source={require('@images/common/backIcon.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>인물별</Text>
          <Text style={styles.headerSub}>총 {tags.length}명의 네컷 친구</Text>
        </View>
        <View style={styles.backIcon} />
      </View>

      {isLoading ? (
        <ActivityIndicator style={{flex: 1}} color="#111" />
      ) : (
        <FlatList
          data={tags}
          keyExtractor={item => item.tagName}
          numColumns={3}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate('GalleryTagDetail', {
                  tagName: item.tagName,
                  color: item.color,
                })
              }
              activeOpacity={0.8}>
              {item.thumbnailUrl ? (
                <Image
                  source={{uri: item.thumbnailUrl}}
                  style={styles.cardThumb}
                />
              ) : (
                <View
                  style={[styles.cardThumb, {backgroundColor: item.color}]}
                />
              )}
              <View style={styles.cardLabel}>
                <Text style={styles.cardName} numberOfLines={1}>
                  {item.tagName}
                </Text>
                <Text style={styles.cardCount}>{item.count}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scaleWidth(16),
    paddingVertical: scaleHeight(20),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8E8E8',
  },
  backIcon: {
    width: scaleWidth(24),
    height: scaleWidth(24),
    resizeMode: 'contain',
  },
  headerCenter: {flex: 1, alignItems: 'center'},
  headerTitle: {
    ...textStyle({fontSize: scaleFont(20), fontWeight: '700', color: '#111'}),
  },
  headerSub: {
    ...textStyle({fontSize: scaleFont(14), color: '#999'}),
    marginTop: scaleHeight(2),
  },
  listContent: {
    paddingHorizontal: scaleWidth(20),
    paddingTop: scaleHeight(16),
  },
  row: {gap: GAP, marginBottom: GAP},
  card: {
    width: CARD_SIZE,
    borderRadius: scaleWidth(8),
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  cardThumb: {
    width: CARD_SIZE,
    height: CARD_SIZE * 1.33,
  },
  cardLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: scaleWidth(6),
    paddingVertical: scaleHeight(5),
  },
  cardName: {
    ...textStyle({fontSize: scaleFont(14), fontWeight: '600', color: '#fff'}),
  },
  cardCount: {
    ...textStyle({fontSize: scaleFont(13), color: 'rgba(255,255,255,0.8)'}),
  },
});
