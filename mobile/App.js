import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View } from 'react-native';
import Routes from './routes';

const DarkTheme = {
  dark: true,
  colors: {
    primary: '#9c27b0',
    background: '#121212',
    card: '#1e1e1e',
    text: '#ffffff',
    border: '#333333',
    notification: '#9c27b0',
  },
  fonts: {
    regular: {
      fontFamily: 'System',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: 'normal',
    },
    light: {
      fontFamily: 'System',
      fontWeight: 'normal',
    },
    thin: {
      fontFamily: 'System',
      fontWeight: 'normal',
    },
  },
};

export default function App() {
  return (
    <View style={{ flex: 1, backgroundColor: '#121212' }}>
      <NavigationContainer theme={DarkTheme}>
        <Routes />
      </NavigationContainer>
    </View>
  );
}