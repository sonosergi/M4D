import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { gql, useApolloClient } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

const CREATE_EVENT_MUTATION = gql`
  mutation CreateEvent($name: String!, $description: String!, $lat: Float!, $lng: Float!, $category: String!, $duration: Int!) {
    createEvent(name: $name, description: $description, lat: $lat, lng: $lng, category: $category, duration: $duration) {
      message
      newEvent {
        id
        user_id
        room_name
        description
        stars
        lat
        lng
        category
        type_post
        duration
      }
    }
  }
`;

const CreateEvent = ({ onEventCreated, markerCoords }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [duration, setDuration] = useState('');
  const client = useApolloClient();

  const handleSubmit = async () => {
    if (!category || !duration) {
      Alert.alert('Error', 'Please select a category and duration');
      return;
    }
    try {
      const sessionToken = await AsyncStorage.getItem('@secureSessionToken');
      const userIdToken = await AsyncStorage.getItem('@secureUserIdToken');
      console.log('sessionTokenCreateEvent:', sessionToken);
      console.log('userIdTokenCreateEvent:', userIdToken);
      const { data } = await client.mutate({ 
        mutation: CREATE_EVENT_MUTATION,
        variables: { name, description, lat: markerCoords.latitude, lng: markerCoords.longitude, category, duration: parseInt(duration) },
        context: {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            'X-User-Id': userIdToken,
          },
        },
      });
      Alert.alert('Success', data.createEvent.message);
      onEventCreated(markerCoords);
    } catch (error) {
      console.error('Failed to create event:', error);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View>
      <TextInput placeholder="Nombre" value={name} onChangeText={setName} />
      <TextInput placeholder="Descripción" value={description} onChangeText={setDescription} />
      <Picker selectedValue={category} onValueChange={(itemValue) => setCategory(itemValue)}>
        <Picker.Item label="Select a category..." value="" />
        <Picker.Item label="Discotecas" value="Discotecas" />
        <Picker.Item label="Restaurantes" value="Restaurantes" />
        <Picker.Item label="Bares & Pubs" value="Bares & Pubs" />
        <Picker.Item label="Otros" value="Otros" />
      </Picker>
      <Picker selectedValue={duration} onValueChange={(itemValue) => setDuration(itemValue)}>
        <Picker.Item label="Select a duration..." value="" />
        {Array.from({ length: 21 }, (_, i) => i + 1).map((value) => (
          <Picker.Item key={value} label={value.toString()} value={value.toString()} />
        ))}
      </Picker>
      <Button title="Crear evento" onPress={handleSubmit} />
    </View>
  );
};

export default CreateEvent;