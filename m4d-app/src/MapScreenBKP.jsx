import React, { useState, useEffect } from 'react';
import { Button } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { customMapStyle } from './styles/customMapStyle.jsx';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_GETMARKERS = 'http://192.168.1.49:10000/posts';
const API_CHAT_ROOMS = 'http://192.168.1.49:7000/chat_rooms';
const API_CREATE_ROOM = 'http://192.168.1.49:7000/chat_room';

const useFetch = (url, initialState = []) => {
  const [data, setData] = useState(initialState);

  const fetchData = async () => {
    const token = await AsyncStorage.getItem('@token');
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const jsonData = await response.json();
    setData(jsonData);
  };

  return [data, fetchData];
};

const Map = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [locations, fetchLocations] = useFetch(API_GETMARKERS);
  const [rooms, fetchRooms] = useFetch(API_CHAT_ROOMS);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    if (isFocused && selectedLocation) {
      navigation.navigate('Post', { id: selectedLocation.id, lat: selectedLocation.lat, lng: selectedLocation.lng });
    }
  }, [isFocused, selectedLocation, navigation]);

  const createRoom = async () => {
    try {
      const token = await AsyncStorage.getItem('@token');
      const response = await fetch(API_CREATE_ROOM, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          // Add the data for the new room here
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Handle the response from the server
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Button title="Create Room" onPress={createRoom} />
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
        {locations.map(location => (
          <Marker
            key={location.id}
            coordinate={{ latitude: location.lat, longitude: location.lng }}
            onPress={() => setSelectedLocation(location)}
          />
        ))}
        {rooms.map(room => (
          <Marker
            key={room.id}
            coordinate={{ latitude: room.lat, longitude: room.lng }}
            onPress={() => {
              setSelectedLocation({ lat: room.lat, lng: room.lng });
              if (isFocused) {
                navigation.navigate('Chat', { roomId: room.id });
              }
            }}
          />
        ))}
      </MapView>
      <Button title="Get All Markers" onPress={fetchLocations} />
    </>
  );
};

export default Map;