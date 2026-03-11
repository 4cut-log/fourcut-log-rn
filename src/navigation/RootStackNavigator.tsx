import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList} from '@type/navigation';
import SplashScreen from '@screens/Splash/SplashScreen';
import AuthStack from '@screens/Auth/AuthStack';
import BottomTabNavigator from './BottomTabNavigator';
import AddLogScreen from '@screens/AddLog/AddLogScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{headerShown: false, animation: 'fade'}}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Auth" component={AuthStack} />
      <Stack.Screen
        name="BottomTab"
        component={BottomTabNavigator}
        options={{gestureEnabled: false}}
      />
      <Stack.Screen
        name="AddLog"
        component={AddLogScreen}
        options={{animation: 'slide_from_right'}}
      />
    </Stack.Navigator>
  );
}
