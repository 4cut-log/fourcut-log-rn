import React from 'react';
import {StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import useAuth from '@hooks/useAuth';
import {LoginComponent} from '@components';

export default function LoginScreen({navigation}: any) {
  const {socialLogin} = useAuth();

  const handleSocialLogin = async (provider: 'kakao' | 'naver') => {
    const success = await socialLogin(provider);
    if (success) {
      navigation.replace('BottomTab');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LoginComponent
        onKakaoPress={() => handleSocialLogin('kakao')}
        onNaverPress={() => handleSocialLogin('naver')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
