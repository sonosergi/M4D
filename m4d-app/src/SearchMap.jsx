import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const SearchMap = () => {
  const [selectedValue, setSelectedValue] = useState('todo');

  return (
    <View style={styles.pickerContainer}>
      <Picker
        selectedValue={selectedValue}
        onValueChange={(itemValue) => setSelectedValue(itemValue)}
      >
        <Picker.Item label="Eventos" value="eventos" />
        <Picker.Item label="Lugares" value="lugares" />
        <Picker.Item label="Todo" value="todo" />
      </Picker>
    </View>
  );
};

const styles = StyleSheet.create({
  pickerContainer: {
    position: 'absolute', 
    top: 10, 
    left: 10, 
    right: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 5,
  },
});

export default SearchMap;