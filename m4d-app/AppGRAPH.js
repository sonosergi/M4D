import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Navigation from './src/Main.jsx';
import LogIn from './src/LogInScreen.jsx';
import Register from './src/RegisterScreen.jsx';
import Map from './src/MapScreen.jsx';
import Profile from './src/ProfileScreen.jsx';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

const Stack = createStackNavigator();

// Configura el cliente Apollo
const client = new ApolloClient({
  uri: 'http://192.168.1.49:7575/graphql',
  credentials: 'include',
  cache: new InMemoryCache()
});

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const navigationRef = useRef();

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  useEffect(() => {
    if (isAuthenticated && isNavigationReady && navigationRef.current) {
      navigationRef.current?.reset({
        index: 0,
        routes: [{ name: 'Map' }],
      });
    }
  }, [isAuthenticated, isNavigationReady]);

  return (
    <ApolloProvider client={client}>
      <NavigationContainer 
        ref={navigationRef} 
        onReady={() => setIsNavigationReady(true)}
      >
        {!isAuthenticated ? (
          <Stack.Navigator>
            <Stack.Screen name="LogIn"
              options={{
                title: '',
                headerShown: false
              }}
            >
              {props => <LogIn {...props} onLogin={handleLogin} />}
            </Stack.Screen>
            <Stack.Screen name="Register"
              options={{
                title: '',
                headerShown: true
              }}
            >
              {props => <Register {...props} onLogin={handleLogin} />}
            </Stack.Screen>
            <Stack.Screen name="Map" component={Map} />
            <Stack.Screen name="Profile" component={Profile} />
          </Stack.Navigator>
        ) : (
          <Navigation />
        )}
      </NavigationContainer>
    </ApolloProvider>
  );
}