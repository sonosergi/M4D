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
import CreateEvent from './CreateEvent.jsx';
import CreatePlace from './CreatePlace.jsx';

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
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [creatingPlace, setCreatingPlace] = useState(false); 
  const [markerCoords, setMarkerCoords] = useState(null);
  const [fabIcon, setFabIcon] = useState('plus');
  const [allowMarkerCreation, setAllowMarkerCreation] = useState(false);

  const resetActionButton = () => {
    setCreatingEvent(false);
    setCreatingPlace(false);
    setShowSearchBar(false);
    setFabIcon('plus');
    setAllowMarkerCreation(false);
    setMarkerCoords(null); // Reset marker coordinates
  };

  const handleMapPress = (e) => {
    if (allowMarkerCreation) {
      setMarkerCoords(e.nativeEvent.coordinate);
      if (creatingEvent) {
        setCreatingEvent(true);
      }
      if (creatingPlace) {
        setCreatingPlace(true);
      }
    }
  };

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

  const handleEventCreated = (coords) => {
    console.log('Evento creado');
    setCreatingEvent(false);
    setMarkerCoords(coords);
  };

  const handlePlaceCreated = (coords) => {
    console.log('Sitio creado');
    setCreatingPlace(false);
    setMarkerCoords(coords);
  };

  const handleActionButtonPress = (action) => {
    switch (action.icon) {
      case 'calendar':
        if (creatingEvent) {
          resetActionButton();
        } else {
          setCreatingEvent(true);
          setCreatingPlace(false);
          setFabIcon('calendar');
          setAllowMarkerCreation(true);
        }
        break;
      case 'map-marker':
        if (creatingPlace) {
          resetActionButton();
        } else {
          setCreatingPlace(true);
          setCreatingEvent(false);
          setFabIcon('map-marker');
          setAllowMarkerCreation(true);
        }
        break;
      case 'magnify':
        if (showSearchBar) {
          resetActionButton();
        } else {
          setShowSearchBar(true);
          setFabIcon('magnify');
        }
        break;
    }
  };

  const actions = [
    { icon: 'calendar', onPress: () => handleActionButtonPress({ icon: 'calendar' }), label: 'Crear evento' },
    { icon: 'magnify', onPress: () => handleActionButtonPress({ icon: 'magnify' }), label: 'Buscar' },
  ];

  if (userType === 'professional') {
    actions.splice(1, 0, { icon: 'map-marker', onPress: () => handleActionButtonPress({ icon: 'map-marker' }), label: 'Crear sitio' });
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
        onPress={handleMapPress}
      >
        {markerCoords && <Marker coordinate={markerCoords} />}
      </MapView>
      {showSearchBar && <SearchMap />}
      {creatingEvent && <CreateEvent onEventCreated={handleEventCreated} markerCoords={markerCoords} />}
      {creatingPlace && <CreatePlace onPlaceCreated={handlePlaceCreated} markerCoords={markerCoords} />}
      <FAB.Group
        open={open}
        icon={fabIcon} // Modified icon prop
        rippleColor="blue"
        backdropColor='transparent'
        actions={actions}
        onStateChange={({ open }) => setOpen(open)}
        onPress={resetActionButton}
      />
    </>
  );
};

export default Map;