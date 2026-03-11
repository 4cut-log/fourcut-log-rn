import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View, Image} from 'react-native';
import {scaleWidth, scaleHeight, scaleFont, textStyle} from '@css/scale';

interface Props {
  onKakaoPress: () => void;
  onNaverPress: () => void;
}

export default function LoginComponent({onKakaoPress, onNaverPress}: Props) {
  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/auth/loginImg.png')}
        style={styles.loginImg}
      />
      <Text style={styles.title}>네컷로그에</Text>
      <Text style={styles.title}>소중한 네컷 사진</Text>
      <Text style={{...styles.title, marginBottom: scaleHeight(20)}}>
        아카이빙하세요!
      </Text>
      <TouchableOpacity onPress={onKakaoPress}>
        <Image
          source={require('@/assets/images/auth/kakao_login.png')}
          style={styles.loginButton}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={onNaverPress}>
        <Image
          source={require('@/assets/images/auth/naver_login.png')}
          style={styles.loginButton}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  loginImg: {
    width: scaleWidth(250),
    height: scaleHeight(350),
    marginBottom: scaleHeight(15),
  },
  title: {
    ...textStyle({fontSize: scaleFont(28), fontWeight: '700'}),
    marginBottom: scaleHeight(8),
  },
  loginButton: {
    width: scaleWidth(250),
    height: scaleHeight(50),
    marginBottom: scaleHeight(10),
    borderRadius: 8,
    overflow: 'hidden',
  },
});
