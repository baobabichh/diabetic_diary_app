import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import FoodRecognitionScreen from '../screens/FoodRecognitionScreen';
import UserScreen from '../screens/UserScreen';
import HistoryScreen from '../screens/HistoryScreen';
import RecordDetailScreen from '../screens/RecordDetailScreen';
import { AuthContext } from '../App';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const FoodStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="FoodRecognitionMain" component={FoodRecognitionScreen} options={{ headerShown: false }} />
    <Stack.Screen name="RecordDetail" component={RecordDetailScreen} options={{ title: 'Record Details' }} />
  </Stack.Navigator>
);

const HistoryStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="HistoryMain" component={HistoryScreen} options={{ headerShown: false }} />
    <Stack.Screen name="RecordDetail" component={RecordDetailScreen} options={{ title: 'Record Details' }} />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'FoodRecognition') {
          iconName = focused ? 'camera' : 'camera-outline';
        } else if (route.name === 'History') {
          iconName = focused ? 'time' : 'time-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        }

        return <Ionicons name={iconName as any} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="FoodRecognition" component={FoodStack} options={{ title: 'Recognize Food', headerShown: false }} />
    <Tab.Screen name="History" component={HistoryStack} options={{ title: 'History', headerShown: false }} />
    <Tab.Screen name="Profile" component={UserScreen} options={{ title: 'Profile' }} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { token } = useContext(AuthContext);

  return (
    <Stack.Navigator>
      {token == null ? (
        <Stack.Screen name="Auth" component={AuthStack} options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;