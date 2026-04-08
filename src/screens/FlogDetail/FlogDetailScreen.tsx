import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '@type/navigation';
import {scaleFont, scaleHeight, scaleWidth, textStyle} from '@css/scale';
import {_useFetch} from '@hooks/useFetch';
import {FlogResponse, deleteFlog} from '@api/flog';
import {useQueryClient} from '@tanstack/react-query';
import FlogMediaSection from '@/components/FlogDetail/FlogMediaSection';
import FlogInfoSection from '@/components/FlogDetail/FlogInfoSection';
import ConfirmModal from '@/components/common/ConfirmModal';

type Props = NativeStackScreenProps<RootStackParamList, 'FlogDetail'>;

export default function FlogDetailScreen({navigation, route}: Props) {
  const {flogId} = route.params;
  const queryClient = useQueryClient();

  const {data, isLoading} = _useFetch<FlogResponse>(`/flogs/${flogId}`, ['flog', flogId]);
  const flog = data?.data;

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return `${dateStr.replaceAll('-', '.')} 네컷로그`;
  };

  const handleBack = () => {
    navigation.canGoBack()
      ? navigation.goBack()
      : navigation.navigate('BottomTab', {screen: 'CalendarTab'});
  };

  const handleDelete = async () => {
    setDeleteModalVisible(false);
    try {
      await deleteFlog(flogId);
      const yearMonth = flog?.date?.substring(0, 7);
      if (yearMonth) {
        queryClient.invalidateQueries({queryKey: ['calendar', yearMonth]});
      }
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('삭제 실패', e?.response?.data?.message ?? '다시 시도해 주세요.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={handleBack}>
          <Image source={require('@images/common/backIcon.png')} style={styles.headerIconImg} />
        </TouchableOpacity>
        <View style={styles.headerTitleRow}>
          <Image source={require('@images/flog/cameraIcon.png')} style={styles.headerTitleIcon} />
          <Text style={styles.headerTitle}> {formatDate(flog?.date)}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('EditLog', {flogId})}>
            <Image source={require('@images/flog/modifyIcon.png')} style={styles.headerIconImg} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setDeleteModalVisible(true)}>
            <Image source={require('@images/flog/deleteIcon.png')} style={styles.headerIconImg} />
          </TouchableOpacity>
        </View>
      </View>

      <ConfirmModal
        visible={deleteModalVisible}
        title="정말 삭제하시겠어요?"
        confirmText="삭제"
        cancelText="취소"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
      />

      {isLoading ? (
        <ActivityIndicator style={styles.loader} color="#111" />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <FlogMediaSection photoUrl={flog?.photoUrl} videoUrl={flog?.videoUrl} />
          <FlogInfoSection
            date={flog?.date}
            tags={flog?.tags}
            location={flog?.location}
            memoCtt={flog?.memoCtt}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#fff'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scaleWidth(16),
    paddingVertical: scaleHeight(12),
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleWidth(6),
  },
  headerTitle: {
    ...textStyle({fontSize: scaleFont(19), fontWeight: '600', color: '#111'}),
  },
  headerTitleIcon: {
    width: scaleWidth(20),
    height: scaleWidth(20),
    resizeMode: 'contain',
    marginBottom: scaleHeight(2),
  },
  headerRight: {
    flexDirection: 'row',
    gap: scaleWidth(4),
  },
  iconBtn: {
    width: scaleWidth(32),
    height: scaleWidth(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconImg: {
    width: scaleWidth(20),
    height: scaleWidth(20),
    resizeMode: 'contain',
  },
  loader: {flex: 1},
  content: {paddingBottom: scaleHeight(40)},
});
