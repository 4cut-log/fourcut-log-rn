import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {GalleryStackParamList} from '@type/navigation';
import GalleryScreen from './GalleryScreen';
import GalleryRecentScreen from './GalleryRecentScreen';
import GalleryByTagScreen from './GalleryByTagScreen';
import GalleryTagDetailScreen from './GalleryTagDetailScreen';

const Stack = createNativeStackNavigator<GalleryStackParamList>();

export default function GalleryStack() {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false, animation: 'slide_from_right'}}>
      <Stack.Screen name="GalleryMain" component={GalleryScreen} />
      <Stack.Screen name="GalleryRecent" component={GalleryRecentScreen} />
      <Stack.Screen name="GalleryByTag" component={GalleryByTagScreen} />
      <Stack.Screen name="GalleryTagDetail" component={GalleryTagDetailScreen} />
    </Stack.Navigator>
  );
}
