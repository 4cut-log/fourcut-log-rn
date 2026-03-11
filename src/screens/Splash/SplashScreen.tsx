import React, {useEffect} from 'react';
import {View, Text, StyleSheet, StatusBar, Image} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '@type/navigation';
import {mmkvStorage, KEY} from '@utils/storage';
import {scaleHeight, scaleWidth} from '@/assets/css/scale';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>;
};

export default function SplashScreen({navigation}: Props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      const isSignedIn = !!mmkvStorage.getString(KEY.ACCESS_TOKEN);
      if (isSignedIn) {
        navigation.replace('BottomTab', {screen: 'CalendarTab'});
      } else {
        navigation.replace('Auth');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

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
          {'오늘도 쌓이는\n닉네임님의 네컷로그'}
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
    alignItems: 'center',
    marginTop: 80,
    zIndex: 10,
  },
  bubble: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  bubbleText: {
    fontSize: 15,
    color: '#222',
    fontWeight: '500',
  },
  bubbleTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#fff',
    marginTop: -1,
  },

  // 이미지
  loginImg: {
    width: scaleWidth(300),
    marginBottom: scaleHeight(40),
  },

  // 하단 텍스트
  textWrapper: {
    marginBottom: 100,
    alignItems: 'center',
  },
  mainText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111',
    textAlign: 'center',
    lineHeight: 38,
  },
});
