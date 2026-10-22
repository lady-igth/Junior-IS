import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { AppProvider, useApp } from './src/state/AppContext';
import OnboardingScreen from './src/screens/OnboardingScreen';
import ScanScreen from './src/screens/ScanScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ProductsScreen from './src/screens/ProductsScreen';
import RoutineScreen from './src/screens/RoutineScreen';
import { colors } from './src/theme';

const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.bg, primary: colors.accent, card: colors.card },
};

const ICONS = {
  Scan: 'scan',
  Profile: 'person',
  Products: 'basket',
  Routine: 'list',
};

const TITLES = {
  Scan: 'Skin Scan',
  Profile: 'Skin Profile',
  Products: 'Recommended Products',
  Routine: 'My Routine',
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        title: TITLES[route.name],
        tabBarLabel: route.name === 'Routine' ? 'My Routine' : route.name,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        headerStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
        headerTitleStyle: { color: colors.ink, fontWeight: '700' },
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name={focused ? ICONS[route.name] : `${ICONS[route.name]}-outline`} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Products" component={ProductsScreen} />
      <Tab.Screen name="Routine" component={RoutineScreen} />
    </Tab.Navigator>
  );
}

function Root() {
  const { ready, onboarded } = useApp();
  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }
  return onboarded ? (
    <NavigationContainer theme={navTheme}>
      <Tabs />
    </NavigationContainer>
  ) : (
    <OnboardingScreen />
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="dark" />
        <Root />
      </AppProvider>
    </SafeAreaProvider>
  );
}
