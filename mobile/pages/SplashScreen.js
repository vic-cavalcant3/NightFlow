import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      navigation.replace('PageRegister'); // ou 'PageLogin'
    }, 4000); // 4 segundos

    return () => clearTimeout(timeout);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/icon.png')} // ajuste o caminho conforme sua estrutura
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.appName}>NightFlow</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
  appName: {
    color: '#9333EA',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
  },
});