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
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RouteProp} from '@react-navigation/native';
import {GalleryStackParamList} from '@type/navigation';
import {_useFetch} from '@hooks/useFetch';
import {
  getGalleryByTag,
  getTagDetail,
  deleteTag,
  GalleryFlogItem,
  TagDetailResponse,
} from '@api/gallery';
import {useQueryClient} from '@tanstack/react-query';
import {scaleFont, scaleHeight, scaleWidth, textStyle} from '@css/scale';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GAP = scaleWidth(2);
const THUMB_SIZE = (SCREEN_WIDTH - GAP * 2) / 3;

type Nav = NativeStackNavigationProp<GalleryStackParamList> & {
  navigate(screen: 'FlogDetail', params: {flogId: string}): void;
};
type Route = RouteProp<GalleryStackParamList, 'GalleryTagDetail'>;

const formatDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-');
  return `${y}년 ${parseInt(m, 10)}월 ${parseInt(d, 10)}일`;
};

export default function GalleryTagDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const {tagName, color} = route.params;
  const queryClient = useQueryClient();

  const [items, setItems] = useState<GalleryFlogItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {data: detailRes} = _useFetch<TagDetailResponse>(
    `/tags/${encodeURIComponent(tagName)}`,
    ['tagDetail', tagName],
  );
  const detail = detailRes?.data;

  const loadMore = useCallback(async () => {
    if (loading || (!hasNext && initialLoaded)) return;
    setLoading(true);
    try {
      const res = await getGalleryByTag(tagName, page);
      setItems(prev => [...prev, ...res.data.content]);
      setHasNext(res.data.hasNext);
      setPage(prev => prev + 1);
      setInitialLoaded(true);
    } finally {
      setLoading(false);
    }
  }, [loading, hasNext, initialLoaded, page, tagName]);

  React.useEffect(() => {
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = () => {
    Alert.alert(
      `'${tagName}' 태그 삭제`,
      '태그를 삭제하면 모든 기록에서 이 태그가 제거됩니다.',
      [
        {text: '취소', style: 'cancel'},
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteTag(tagName);
              queryClient.invalidateQueries({queryKey: ['tags']});
              queryClient.invalidateQueries({queryKey: ['gallery']});
              navigation.goBack();
            } catch {
              Alert.alert('삭제 실패', '다시 시도해 주세요.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
    );
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
        <Text style={styles.headerTitle}>{tagName}</Text>
        <TouchableOpacity onPress={handleDelete} hitSlop={8} disabled={isDeleting}>
          <Image
            source={require('@images/flog/deleteIcon.png')}
            style={styles.trashIcon}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={item => item.flogId}
        numColumns={3}
        columnWrapperStyle={styles.row}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          detail ? (
            <View style={styles.infoCard}>
              <Text style={styles.colorDot}>🐶</Text>
              <View>
                <Text style={styles.infoCount}>{detail.count}건의 기억</Text>
                {detail.firstDate && (
                  <Text style={styles.infoDate}>
                    첫 네컷로그: {formatDate(detail.firstDate)}
                  </Text>
                )}
                {detail.lastDate && (
                  <Text style={styles.infoDate}>
                    최근 네컷로그: {formatDate(detail.lastDate)}
                  </Text>
                )}
              </View>
            </View>
          ) : null
        }
        renderItem={({item}) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('FlogDetail', {flogId: item.flogId})
            }
            activeOpacity={0.85}>
            <Image
              source={{uri: item.photoUrl}}
              style={styles.thumb}
            />
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
    justifyContent: 'space-between',
    paddingHorizontal: scaleWidth(16),
    paddingVertical: scaleHeight(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8E8E8',
  },
  backIcon: {
    width: scaleWidth(24),
    height: scaleWidth(24),
    resizeMode: 'contain',
  },
  headerTitle: {
    ...textStyle({fontSize: scaleFont(20), fontWeight: '700', color: '#111'}),
  },
  trashIcon: {
    width: scaleWidth(22),
    height: scaleWidth(22),
    resizeMode: 'contain',
    tintColor: '#888',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleWidth(12),
    margin: scaleWidth(16),
    padding: scaleWidth(16),
    backgroundColor: '#F8F8F8',
    borderRadius: scaleWidth(12),
  },
  colorDot: {
    fontSize: scaleFont(36),
  },
  infoCount: {
    ...textStyle({fontSize: scaleFont(17), fontWeight: '600', color: '#111'}),
    marginBottom: scaleHeight(4),
  },
  infoDate: {
    ...textStyle({fontSize: scaleFont(15), color: '#666'}),
    marginTop: scaleHeight(2),
  },
  row: {gap: GAP, marginBottom: GAP},
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE * 1.33,
    backgroundColor: '#f0f0f0',
  },
});
