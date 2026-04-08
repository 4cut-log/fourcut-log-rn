import React from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {LocaleConfig} from 'react-native-calendars';
import RootStackNavigator from './src/navigation/RootStackNavigator';
import {navigationRef} from './src/navigation/navigationRef';

LocaleConfig.locales['ko'] = {
  monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
};
LocaleConfig.defaultLocale = 'ko';

const queryClient = new QueryClient();

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{flex: 1}}>
        <SafeAreaProvider>
          <NavigationContainer ref={navigationRef}>
            <StatusBar
              barStyle={isDarkMode ? 'light-content' : 'dark-content'}
              backgroundColor={isDarkMode ? '#000' : '#fff'}
            />
            <RootStackNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

export default App;
