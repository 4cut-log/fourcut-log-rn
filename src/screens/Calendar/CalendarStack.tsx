import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {CalendarStackParamList} from '@type/navigation';
import CalendarScreen from './CalendarScreen';

const Stack = createNativeStackNavigator<CalendarStackParamList>();

export default function CalendarStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="CalendarMain" component={CalendarScreen} />
      {/* 캘린더 상세 화면은 여기에 추가 */}
    </Stack.Navigator>
  );
}
