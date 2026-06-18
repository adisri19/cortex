import React, { useRef, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import CampaignPreviewScreen from '../screens/CampaignPreviewScreen';
import CartBadge from '../components/common/CartBadge';
import { useTheme } from '../context/ThemeContext';
import { setNavigationRef } from '../dispatcher/ActionDispatcher';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Product Details' }} />
      <Stack.Screen name="CampaignPreview" component={CampaignPreviewScreen} options={{ title: 'Campaign Hub' }} />
    </Stack.Navigator>
  );
}

function MainTabNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'ChatTab') {
            iconName = focused ? 'sparkles' : 'sparkles-outline';
          } else if (route.name === 'CartTab') {
            return <CartBadge />;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: '#888888',
        headerShown: false,
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: 'Home' }} />
      <Tab.Screen name="ChatTab" component={ChatScreen} options={{ title: 'AI Assistant' }} />
      <Tab.Screen name="CartTab" component={CartScreen} options={{ title: 'Cart' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const containerRef = useRef<any>(null);

  useEffect(() => {
    if (containerRef.current) {
      setNavigationRef(containerRef.current);
    }
  }, [containerRef]);

  return (
    <NavigationContainer ref={containerRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen 
          name="ChatModal" 
          component={ChatScreen} 
          options={{ presentation: 'modal' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
