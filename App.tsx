import React from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {LoginScreen} from '@screens';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#000' : '#fff'}
      />
      <LoginScreen />
    </>
  );
}

export default App;
