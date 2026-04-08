import React from 'react';
import {Image} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {CommonActions} from '@react-navigation/native';
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
        tabBarItemStyle: {justifyContent: 'center', paddingBottom: 4},
        tabBarIconStyle: {marginTop: 6, marginBottom: 4},
      }}>
      <Tab.Screen
        name="CalendarTab"
        component={CalendarStack}
        options={{
          tabBarLabel: '캘린더',
          tabBarIcon: ({color}) => (
            <Image
              source={require('@images/common/calendarIcon.png')}
              style={{
                width: 24,
                height: 24,
                resizeMode: 'contain',
                tintColor: color,
              }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="GalleryTab"
        component={GalleryStack as any}
        listeners={({navigation}) => ({
          blur: () => {
            const state = navigation.getState();
            const galleryRoute = state.routes.find(
              (r: any) => r.name === 'GalleryTab',
            );
            const stackKey = galleryRoute?.state?.key;
            if (stackKey) {
              navigation.dispatch({
                ...CommonActions.reset({
                  index: 0,
                  routes: [{name: 'GalleryMain'}],
                }),
                target: stackKey,
              });
            }
          },
        })}
        options={{
          tabBarLabel: '갤러리',
          tabBarIcon: ({color}) => (
            <Image
              source={require('@images/flog/photosIcon.png')}
              style={{
                width: 24,
                height: 24,
                resizeMode: 'contain',
                tintColor: color,
              }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="MoreTab"
        component={MoreStack}
        options={{
          tabBarLabel: '더보기',
          tabBarIcon: ({color}) => (
            <Image
              source={require('@images/common/moreIcon.png')}
              style={{
                width: 24,
                height: 24,
                resizeMode: 'contain',
                tintColor: color,
              }}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
