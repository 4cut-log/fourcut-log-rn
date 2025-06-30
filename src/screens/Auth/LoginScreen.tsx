import React from 'react';
import {View, Text, Button} from 'react-native';
import {SafeAreaView} from 'react-native';

export default function LoginScreen({navigation}: any) {
  return (
    <SafeAreaView>
      <Text>로그인 화면</Text>
      <Button title="홈으로 이동" onPress={() => navigation.navigate('Home')} />
    </SafeAreaView>
  );
}
