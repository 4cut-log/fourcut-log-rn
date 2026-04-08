import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {MoreStackParamList} from '@type/navigation';
import MoreScreen from './MoreScreen';
import EditProfileScreen from './EditProfileScreen';

const Stack = createNativeStackNavigator<MoreStackParamList>();

export default function MoreStack() {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false, animation: 'slide_from_right'}}>
      <Stack.Screen name="MoreMain" component={MoreScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  );
}
