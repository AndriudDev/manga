import React, { useEffect, useState } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import { Colors } from '../theme/colors';
import { AuthController } from '../controllers/AuthController';

const Stack = createNativeStackNavigator<RootStackParamList>();

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.backgroundPrimary },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreenWrapper} />
        <Stack.Screen name="Login" component={LoginScreenWrapper} />
        <Stack.Screen name="Register" component={RegisterScreenWrapper} />
        <Stack.Screen name="Home" component={HomeScreenWrapper} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function WelcomeScreenWrapper() {
  const navigation = useNavigation<NavProp>();
  return <WelcomeScreen onLogin={() => navigation.navigate('Login')} />;
}

function LoginScreenWrapper() {
  const navigation = useNavigation<NavProp>();
  return (
    <LoginScreen
      onRegister={() => navigation.navigate('Register')}
      onLoginSuccess={() => navigation.navigate('Home')}
    />
  );
}

function RegisterScreenWrapper() {
  const navigation = useNavigation<NavProp>();
  return (
    <RegisterScreen
      onBackToLogin={() => navigation.navigate('Login')}
      onRegisterSuccess={() => navigation.navigate('Home')}
    />
  );
}

function HomeScreenWrapper() {
  const navigation = useNavigation<NavProp>();
  const [userName, setUserName] = useState<string | undefined>(undefined);

  useEffect(() => {
    AuthController.getCurrentUser().then((user) => setUserName(user?.name));
  }, []);

  return (
    <HomeScreen
      userName={userName}
      onLogout={() => navigation.popToTop()}
    />
  );
}
