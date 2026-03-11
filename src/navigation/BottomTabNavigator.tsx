import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {RootBottomTabParamList} from '@type/navigation';
import CalendarStack from '@screens/Calendar/CalendarStack';
import GalleryStack from '@screens/Gallery/GalleryStack';
import MoreStack from '@screens/More/MoreStack';

const Tab = createBottomTabNavigator<RootBottomTabParamList>();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
        },
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#999',
      }}>
      <Tab.Screen
        name="CalendarTab"
        component={CalendarStack}
        options={{tabBarLabel: '캘린더'}}
      />
      <Tab.Screen
        name="GalleryTab"
        component={GalleryStack}
        options={{tabBarLabel: '갤러리'}}
      />
      <Tab.Screen
        name="MoreTab"
        component={MoreStack}
        options={{tabBarLabel: '더보기'}}
      />
    </Tab.Navigator>
  );
}
