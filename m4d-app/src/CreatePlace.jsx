import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { gql, useApolloClient } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

const CREATE_PLACE_MUTATION = gql`
  mutation CreatePlace($name: String!, $description: String!, $lat: Float!, $lng: Float!, $category: String!) {
    createPlace(name: $name, description: $description, lat: $lat, lng: $lng, category: $category) {
      message
      newPlace {
        id
        user_id
        room_name
        description
        stars
        lat
        lng
        category
        type_post
      }
    }
  }
`;

const CreatePlace = ({ onPlaceCreated, markerCoords }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Discotecas');
  const client = useApolloClient();

  const handleSubmit = async () => {
    try {
      const sessionToken = await AsyncStorage.getItem('@secureSessionToken');
      const userIdToken = await AsyncStorage.getItem('@secureUserIdToken');
      console.log('sessionTokenCreateEvent:', sessionToken);
      console.log('userIdTokenCreateEvent:', userIdToken);
      const { data } = await client.mutate({ 
        mutation: CREATE_PLACE_MUTATION,
        variables: { name, description, lat: markerCoords.latitude, lng: markerCoords.longitude, category },
        context: {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            'X-User-Id': userIdToken,
          },
        },
      });
      Alert.alert('Success', data.createPlace.message);
      onPlaceCreated(markerCoords);
    } catch (error) {
      console.error('Failed to create place:', error);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View>
      <TextInput placeholder="Nombre" value={name} onChangeText={setName} />
      <TextInput placeholder="Descripción" value={description} onChangeText={setDescription} />
      <Picker selectedValue={category} onValueChange={(itemValue) => setCategory(itemValue)}>
        <Picker.Item label="Discotecas" value="Discotecas" />
        <Picker.Item label="Restaurantes" value="Restaurantes" />
        <Picker.Item label="Bares & Pubs" value="Bares & Pubs" />
        <Picker.Item label="Otros" value="Otros" />
      </Picker>
      <Button title="Crear Sitio" onPress={handleSubmit} />
    </View>
  );
};

export default CreatePlace;