import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PageRegister from './pages/RegistrerPage';
import PageLogin from './pages/LoginPage';
import SplashScreen from './pages/SplashScreen';
import HomeScreen from './pages/HomeScreen';
import Goals from './pages/GoalsPage';
import Calendar from './pages/CalendarPage'
import Perfil from './pages/PerfilPage'



const Stack = createNativeStackNavigator();

export default function Routes() {
  return (
    <Stack.Navigator initialRouteName="PageRegister" >
      <Stack.Screen name="SplashScreen" component={SplashScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PageRegister" component={PageRegister}  options={{ headerShown: false }} />
      <Stack.Screen name="PageLogin" component={PageLogin} options={{ headerShown: false }}  />
      <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }}  />
      <Stack.Screen name="Goals" component={Goals} options={{ headerShown: false }}  />
      <Stack.Screen name="Calendar" component={Calendar} options={{ headerShown: false }}  />
      <Stack.Screen name="Perfil" component={Perfil} options={{ headerShown: false }}  />




    </Stack.Navigator>
  );
}
