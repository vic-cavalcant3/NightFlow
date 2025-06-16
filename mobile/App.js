import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Routes from './routes';

const Stack = createStackNavigator();

const MeteorBackground = () => {
  const meteors = Array(15).fill(0).map((_, i) => {
    const left = Math.random() * 100; // Valor fixo em %
    const translateY = new Animated.Value(-100 - Math.random() * 300);
    const size = 5 + Math.random() * 15;
    const duration = 3000 + Math.random() * 5000;
    const delay = Math.random() * 5000;
    const opacity = 0.5 + Math.random() * 0.5;
    const rotation = Math.random() * 360;

    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(translateY, {
          toValue: 1000,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ])
    ).start();

    return {
      left,
      translateY,
      size,
      opacity,
      rotation,
    };
  });

  return (
    <View style={StyleSheet.absoluteFillObject}>
      {meteors.map((meteor, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: `${meteor.left}%`,
            top: 0, // Posição fixa
            width: meteor.size,
            height: meteor.size * 3,
            backgroundColor: '#9c27b0',
            opacity: meteor.opacity,
            borderRadius: meteor.size / 2,
            transform: [
              { translateY: meteor.translateY }, // Usa translateY para animação
              { rotate: `${meteor.rotation}deg` },
              { skewX: '45deg' }
            ],
          }}
        />
      ))}
    </View>
  );
};

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
      <MeteorBackground />
      <NavigationContainer theme={DarkTheme}>
        <Routes />
      </NavigationContainer>
    </View>
  );
}