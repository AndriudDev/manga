import React, { useEffect } from 'react';
import AppNavigator from './src/screens/AppNavigator';
import { UserRepository } from './src/models/UserRepository';

export default function App() {
  useEffect(() => {
    UserRepository.seedAdminUser();
  }, []);

  return <AppNavigator />;
}