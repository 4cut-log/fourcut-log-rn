import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View, Image} from 'react-native';
import {scaleWidth, scaleHeight, scaleFont, textStyle} from '@css/scale';
import KakaoBi from '@/assets/images/auth/talk_bi.svg';
import NaverBi from '@/assets/images/auth/naver_bi.svg';

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
      <View style={styles.text}>
        <Text style={styles.title}>네컷로그에</Text>
        <Text style={styles.title}>소중한 네컷 사진</Text>
        <Text style={{...styles.title, marginBottom: scaleHeight(20)}}>
          아카이빙하세요!
        </Text>
      </View>
      <TouchableOpacity style={styles.kakaoButton} onPress={onKakaoPress}>
        <KakaoBi
          width={scaleWidth(22)}
          height={scaleHeight(22)}
          style={styles.buttonIcon}
        />
        <Text style={styles.kakaoButtonText}>카카오로 시작하기</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.naverButton} onPress={onNaverPress}>
        <NaverBi
          width={scaleWidth(22)}
          height={scaleHeight(22)}
          style={styles.buttonIcon}
        />
        <Text style={styles.naverButtonText}>네이버로 시작하기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  loginImg: {
    width: scaleWidth(220),
    height: scaleHeight(300),
    marginBottom: scaleHeight(15),
  },
  text: {
    alignItems: 'center',
    padding: scaleHeight(10),
    marginBottom: scaleHeight(10),
  },
  title: {
    ...textStyle({fontSize: scaleFont(27), fontWeight: '700'}),
    marginBottom: scaleHeight(5),
  },
  kakaoButton: {
    width: scaleWidth(220),
    height: scaleHeight(50),
    backgroundColor: '#FEE500',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scaleWidth(16),
    marginBottom: scaleHeight(12),
  },
  kakaoButtonText: {
    ...textStyle({fontSize: scaleFont(22), fontWeight: '700'}),
    color: '#191919',
    flex: 1,
    textAlign: 'center',
  },
  buttonIcon: {
    width: scaleWidth(22),
    height: scaleHeight(22),
  },
  naverButton: {
    width: scaleWidth(220),
    height: scaleHeight(50),
    backgroundColor: '#03C75A',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scaleWidth(16),
    marginBottom: scaleHeight(12),
  },
  naverButtonText: {
    ...textStyle({fontSize: scaleFont(22), fontWeight: '700'}),
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
});
