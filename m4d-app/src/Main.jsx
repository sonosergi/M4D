import React, { useState, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AppRegistry } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Map from "./MapScreen.jsx";
import Profile from "./ProfileScreen.jsx";

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const Tab = createBottomTabNavigator();

function Main({ isAuthenticated }) {
  return (    
    <Tab.Navigator
      initialRouteName={isAuthenticated ? "Map" : "LogIn"}
      screenOptions={{
        tabBarActiveTintColor: "blue",
        tabBarInactiveTintColor: "gray",
        tabBarLabelStyle: {
          fontSize: 20,
        },
        headerTitle: '', 
        headerStyle: {
          height: 40, 
        },
        tabBarStyle: {
          height: 50, 
        }
      }}
    >
    
      <Tab.Screen
        name="Map" 
        component={Map}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="map" color={color} size={size} />
          ),
          headerShown: true,
        }} 
      />
      
      <Tab.Screen 
        name="Profile" 
        component={Profile}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
          headerShown: true,
        }} 
      />

    </Tab.Navigator>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('@token');
      setIsAuthenticated(!!token);
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return null;
  }

  return (
    <Main isAuthenticated={isAuthenticated} />
  );
}

AppRegistry.registerComponent('main', () => App);

export default Main;