import React, {useState, useCallback} from 'react';
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
import {getGalleryRecent, GalleryFlogItem} from '@api/gallery';
import {scaleFont, scaleHeight, scaleWidth, textStyle} from '@css/scale';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GAP = scaleWidth(2);
const THUMB_SIZE = (SCREEN_WIDTH - GAP * 2) / 3;

type Nav = NativeStackNavigationProp<GalleryStackParamList> & {
  navigate(screen: 'FlogDetail', params: {flogId: string}): void;
};

export default function GalleryRecentScreen() {
  const navigation = useNavigation<Nav>();
  const [items, setItems] = useState<GalleryFlogItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  const loadMore = useCallback(async () => {
    if (loading || (!hasNext && initialLoaded)) return;
    setLoading(true);
    try {
      const res = await getGalleryRecent(page);
      setItems(prev => [...prev, ...res.data.content]);
      setHasNext(res.data.hasNext);
      setTotalCount(res.data.totalCount);
      setPage(prev => prev + 1);
      setInitialLoaded(true);
    } finally {
      setLoading(false);
    }
  }, [loading, hasNext, initialLoaded, page]);

  React.useEffect(() => {
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const firstDate = items.length > 0 ? items[items.length - 1].date : null;
  const lastDate = items.length > 0 ? items[0].date : null;
  const formatDateRange = () => {
    if (!firstDate || !lastDate) return '';
    const fmt = (d: string) => {
      const [y, m] = d.split('-');
      return `${y}년 ${parseInt(m, 10)}월`;
    };
    return `${fmt(firstDate)} ~ ${fmt(lastDate)}`;
  };

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
          <Text style={styles.headerTitle}>최신순</Text>
          {firstDate && (
            <Text style={styles.headerSub}>{formatDateRange()}</Text>
          )}
        </View>
        <View style={styles.backIcon} />
      </View>

      <FlatList
        data={items}
        keyExtractor={item => item.flogId}
        numColumns={3}
        columnWrapperStyle={styles.row}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        renderItem={({item}) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('FlogDetail', {flogId: item.flogId})
            }
            activeOpacity={0.85}>
            <Image source={{uri: item.photoUrl}} style={styles.thumb} />
          </TouchableOpacity>
        )}
        ListFooterComponent={
          loading ? (
            <ActivityIndicator
              style={{marginVertical: scaleHeight(16)}}
              color="#111"
            />
          ) : null
        }
      />
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
  row: {gap: GAP, marginBottom: GAP},
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE * 1.33,
    backgroundColor: '#f0f0f0',
  },
});
