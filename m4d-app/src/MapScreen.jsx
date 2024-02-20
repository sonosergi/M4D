import React, { useEffect, useState } from 'react';
import { TextInput, View, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { customMapStyle } from './styles/customMapStyle.jsx';
import { FAB } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import "core-js/stable/atob";
import SearchMap from './SearchMap.jsx'; // Import the SearchMap component


const decodeToken = async (tokenKey) => {
  try {
    const token = await AsyncStorage.getItem(tokenKey);
    console.log('tokeeeeeen:', token);
    return token ? jwtDecode(token) : null;
  } catch (error) {
    console.error('Failed to fetch or decode token:', error);
    return null;
  }
};

const Map = () => {
  const [sessionToken, setSessionToken] = useState(null);
  const [open, setOpen] = useState(false);
  const [userType, setUserType] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);

  useEffect(() => {
    const fetchToken = async () => {
      const token = await AsyncStorage.getItem('@secureSessionToken');
      const userTypeToken = await decodeToken('@secureUserTypeToken');
      console.log('userTypeToken:', userTypeToken);
      setSessionToken(token);
      if (userTypeToken) {
        console.log('decodedToken:', userTypeToken);
        setUserType(userTypeToken.type);
      }
    };
    fetchToken();
  }, []);

  if (!userType) {
    return null; 
  }
  console.log('userType:', userType);

  const actions = [
    { icon: 'calendar', onPress: () => console.log('Crear evento'), label: 'Crear evento' },
    { icon: 'magnify', onPress: () => setShowSearchBar(!showSearchBar), label: 'Buscar' },
  ];

  if (userType === 'professional') {
    actions.splice(1, 0, { icon: 'map-marker', onPress: () => console.log('Crear punto'), label: 'Crear punto' });
  }

  return (
    <>
      <MapView
        provider={PROVIDER_GOOGLE} 
        customMapStyle={customMapStyle} 
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 40.416775,
          longitude: -3.70379,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        mapType="standard"
      >
      </MapView>
      {showSearchBar && <SearchMap />}
      <FAB.Group
        open={open}
        icon={open ? 'map' : 'plus'}
        rippleColor="blue"
        backdropColor='transparent'
        actions={actions}
        onStateChange={({ open }) => setOpen(open)}
        onPress={() => {
          if (open) {
            // do something if the button is open
          }
        }}
      />
    </>
  );
};


export default Map;