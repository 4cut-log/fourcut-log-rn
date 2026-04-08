import React, {useEffect} from 'react';
import {View, Text, StyleSheet, StatusBar, Image, Alert, Linking, Platform} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '@type/navigation';
import {mmkvStorage, KEY} from '@/utils/storage';
import {getAppVersion, APP_CURRENT_VERSION, isVersionLower} from '@api/version';
import {
  scaleFont,
  scaleHeight,
  scaleWidth,
  textStyle,
} from '@/assets/css/scale';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>;
};

export default function SplashScreen({navigation}: Props) {
  const isSignedIn = !!mmkvStorage.getString(KEY.ACCESS_TOKEN);
  const nickname = mmkvStorage.getString(KEY.NICKNAME);

  useEffect(() => {
    const init = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));

      try {
        const res = await getAppVersion();
        const {minRequiredVersion, iosStoreUrl, aosStoreUrl} = res.data;

        if (isVersionLower(APP_CURRENT_VERSION, minRequiredVersion)) {
          const storeUrl = Platform.OS === 'ios' ? iosStoreUrl : aosStoreUrl;
          Alert.alert(
            '업데이트 필요',
            '서비스 이용을 위해 최신 버전으로 업데이트해주세요.',
            [
              {
                text: '업데이트',
                onPress: () => {
                  if (storeUrl) Linking.openURL(storeUrl);
                },
              },
            ],
            {cancelable: false},
          );
          return; // 강제 업데이트: 앱 진입 차단
        }
      } catch {}

      if (isSignedIn) {
        navigation.replace('BottomTab', {screen: 'CalendarTab'});
      } else {
        navigation.replace('Auth');
      }
    };

    init();
  }, [navigation, isSignedIn]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* 말풍선 */}
      <View style={styles.bubbleWrapper}>
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>좋은 하루 보내세요!</Text>
        </View>
        <View style={styles.bubbleTail} />
      </View>

      {/* 이미지 */}
      <Image
        source={require('@/assets/images/auth/loginImg.png')}
        style={styles.loginImg}
      />
      {/* 하단 텍스트 */}
      <View style={styles.textWrapper}>
        <Text style={styles.mainText}>
          {isSignedIn && nickname
            ? `오늘도 쌓이는\n${nickname}님의 네컷로그`
            : `오늘도 쌓이는\n네컷로그`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },

  // 말풍선
  bubbleWrapper: {
    marginLeft: scaleWidth(70),
    paddingTop: scaleHeight(80),
    marginTop: scaleHeight(80),
  },
  bubble: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: scaleWidth(12),
    paddingVertical: scaleHeight(8),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  bubbleText: {
    ...textStyle({fontSize: scaleFont(15)}),
    color: '#222',
  },
  bubbleTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#fff',
    marginLeft: scaleWidth(60),
    marginBottom: scaleHeight(5),
  },

  // 이미지
  loginImg: {
    width: scaleWidth(230),
    height: scaleHeight(320),
    marginBottom: scaleHeight(20),
  },

  // 하단 텍스트
  textWrapper: {
    marginBottom: 100,
    alignItems: 'center',
  },
  mainText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111',
    textAlign: 'center',
    lineHeight: 38,
  },
});
