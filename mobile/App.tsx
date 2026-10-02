import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SutraTheme } from './src/theme/tokens';

import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { OrdersScreen } from './src/screens/OrdersScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { ProjectsScreen } from './src/screens/ProjectsScreen';
import { MoreScreen } from './src/screens/MoreScreen';
import { NewOrderScreen } from './src/screens/NewOrderScreen';

import {
  Home,
  FileCheck2,
  MessageSquare,
  FolderGit2,
  Menu,
} from 'lucide-react-native';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="NewOrder" component={NewOrderScreen} />
    </Stack.Navigator>
  );
}

function MainTabs({ onLogout }: { onLogout: () => void }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: SutraTheme.colors.surface,
          borderTopColor: SutraTheme.colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: SutraTheme.colors.brown,
        tabBarInactiveTintColor: SutraTheme.colors.mutedLight,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size - 2} color={color} />,
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarLabel: 'Orders',
          tabBarIcon: ({ color, size }) => <FileCheck2 size={size - 2} color={color} />,
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarLabel: 'Sutra AI',
          tabBarIcon: ({ color, size }) => <MessageSquare size={size - 2} color={color} />,
        }}
      />
      <Tab.Screen
        name="Projects"
        component={ProjectsScreen}
        options={{
          tabBarLabel: 'Projects',
          tabBarIcon: ({ color, size }) => <FolderGit2 size={size - 2} color={color} />,
        }}
      />
      <Tab.Screen
        name="More"
        options={{
          tabBarLabel: 'More',
          tabBarIcon: ({ color, size }) => <Menu size={size - 2} color={color} />,
        }}
      >
        {() => <MoreScreen onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        {isAuthenticated ? (
          <MainTabs onLogout={() => setIsAuthenticated(false)} />
        ) : (
          <WelcomeScreen onLogin={() => setIsAuthenticated(true)} />
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
