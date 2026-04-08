import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {MoreStackParamList} from '@type/navigation';
import {_useFetch} from '@hooks/useFetch';
import {postLogout} from '@api/auth';
import {deleteAccount, UserProfile} from '@api/user';
import {
  APP_CURRENT_VERSION,
  AppVersionInfo,
  isVersionLower,
} from '@api/version';
import {mmkvStorage, KEY} from '@utils/storage';
import {navigateToAuth} from '@/navigation/navigationRef';
import {scaleFont, scaleHeight, scaleWidth, textStyle} from '@css/scale';

type Nav = NativeStackNavigationProp<MoreStackParamList>;

export default function MoreScreen() {
  const navigation = useNavigation<Nav>();

  const {data: profileRes, isLoading} = _useFetch<{
    status: number;
    data: UserProfile;
    message: string;
  }>('/users/me', ['userProfile']);

  const {data: versionRes} = _useFetch<{
    status: number;
    data: AppVersionInfo;
    message: string;
  }>('/app/version', ['appVersion']);

  const nickname = profileRes?.data?.nickname ?? '';
  const versionInfo = versionRes?.data;
  const hasUpdate = versionInfo
    ? isVersionLower(APP_CURRENT_VERSION, versionInfo.latestVersion)
    : false;

  const handleLogout = () => {
    Alert.alert('로그아웃', '로그아웃 하시겠어요?', [
      {text: '취소', style: 'cancel'},
      {
        text: '로그아웃',
        onPress: async () => {
          try {
            await postLogout();
          } catch {}
          mmkvStorage.delete(KEY.ACCESS_TOKEN);
          mmkvStorage.delete(KEY.REFRESH_TOKEN);
          mmkvStorage.delete(KEY.NICKNAME);
          navigateToAuth();
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '회원탈퇴',
      '탈퇴 시 모든 기록이 삭제되며\n복구가 불가합니다.',
      [
        {text: '취소', style: 'cancel'},
        {
          text: '탈퇴하기',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
            } catch {}
            mmkvStorage.delete(KEY.ACCESS_TOKEN);
            mmkvStorage.delete(KEY.REFRESH_TOKEN);
            mmkvStorage.delete(KEY.NICKNAME);
            navigateToAuth();
          },
        },
      ],
    );
  };

  const handleUpdatePress = () => {
    const url =
      Platform.OS === 'ios'
        ? versionInfo?.iosStoreUrl
        : versionInfo?.aosStoreUrl;
    if (url) {
      Linking.openURL(url);
    } else {
      Alert.alert('준비 중입니다.');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ActivityIndicator style={{flex: 1}} color="#111" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 본문 */}
      <View style={styles.content}>
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>
            {'🧚 '}
            <Text style={styles.greetingNickname}>{nickname}</Text>
            {'님 반가워요'}
          </Text>
        </View>

        <View style={styles.group}>
          <MenuItem
            label="프로필 수정하기"
            onPress={() => navigation.navigate('EditProfile')}
          />
          <MenuItem label="문의하기" onPress={() => {}} />
        </View>

        <View style={styles.divider} />

        {/* 앱 버전 */}
        <View style={styles.group}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={hasUpdate ? handleUpdatePress : undefined}
            activeOpacity={hasUpdate ? 0.6 : 1}>
            <Text style={styles.menuLabel}>앱 버전</Text>
            <View style={styles.versionRight}>
              {hasUpdate && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>N</Text>
                </View>
              )}
              <Text style={styles.infoValue}>{APP_CURRENT_VERSION}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* 하단 로그아웃/탈퇴 바 */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomHalf} onPress={handleDeleteAccount}>
          <Text style={styles.deleteLabel}>회원탈퇴</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomHalf} onPress={handleLogout}>
          <Text style={styles.logoutLabel}>로그아웃</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function MenuItem({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.6}>
      <Text style={styles.menuLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  content: {flex: 1},
  greeting: {
    paddingHorizontal: scaleWidth(24),
    paddingTop: scaleHeight(32),
    paddingBottom: scaleHeight(24),
  },
  greetingText: {
    ...textStyle({fontSize: scaleFont(22), fontWeight: '700', color: '#111'}),
  },
  greetingNickname: {
    ...textStyle({fontSize: scaleFont(22), fontWeight: '700', color: '#111'}),
  },
  group: {
    paddingHorizontal: scaleWidth(24),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: scaleHeight(16),
  },
  menuLabel: {
    ...textStyle({fontSize: scaleFont(17), color: '#111'}),
  },
  versionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleWidth(8),
  },
  infoValue: {
    ...textStyle({fontSize: scaleFont(16), color: '#bbb'}),
  },
  newBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    paddingHorizontal: scaleWidth(6),
    paddingVertical: 2,
  },
  newBadgeText: {
    ...textStyle({fontSize: scaleFont(11), fontWeight: '700', color: '#fff'}),
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: scaleHeight(8),
    marginHorizontal: scaleWidth(24),
  },
  bottomBar: {
    flexDirection: 'row',
    height: scaleHeight(64),
  },
  bottomHalf: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteLabel: {
    ...textStyle({fontSize: scaleFont(15), color: '#bbb'}),
  },
  logoutLabel: {
    ...textStyle({fontSize: scaleFont(15), color: '#FF3B30'}),
  },
});
