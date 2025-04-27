import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const bootstrapAsync = async () => {
      let token = null;
      try {
        token = await AsyncStorage.getItem('userToken');
      } catch (e) {
        console.log('Failed to get token from storage');
      }
      setUserToken(token);
      setIsLoading(false);
    };

    bootstrapAsync();
  }, []);

  const authContext = React.useMemo(() => ({
    signIn: async (token: string) => {
      setUserToken(token);
      try {
        await AsyncStorage.setItem('userToken', token);
      } catch (e) {
        console.log('Failed to save token');
      }
    },
    signOut: async () => {
      setUserToken(null);
      try {
        await AsyncStorage.removeItem('userToken');
      } catch (e) {
        console.log('Failed to remove token');
      }
    },
    token: userToken,
  }), [userToken]);

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <AppNavigator />
        <StatusBar style="auto" />
      </NavigationContainer>
    </AuthContext.Provider>
  );
}

export const AuthContext = React.createContext<{
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  token: string | null;
}>({
  signIn: async () => {},
  signOut: async () => {},
  token: null,
});