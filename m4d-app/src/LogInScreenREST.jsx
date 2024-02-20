import React, { useLayoutEffect, useEffect, useState } from 'react';
import { View, TextInput, Button, Text, TouchableOpacity } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import styles from "./styles/LoginCustomStyles"
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const validationSchema = Yup.object().shape({
  username: Yup.string().required('Por favor, rellene todos los campos'),
  password: Yup.string().required('Por favor, rellene todos los campos'),
});

function LogIn({ onLogin }) {
  const navigation = useNavigation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);

  useLayoutEffect(() => {
    if (isAuthenticated && navigation) {
      navigation.navigate('Map');
    }
  }, [isAuthenticated, navigation]);

  useEffect(() => {
    if (token) {
      setIsAuthenticated(true);
    }
  }, [token]);

  const handleRegister = () => {
    if (navigation) {
      navigation.navigate('Register');
    }
  }

  const storeToken = async (value) => {
    try {
      await AsyncStorage.setItem('@token', value)
    } catch (e) {
      console.log(e);
    }
  }

  const getNoAuthCookie = async () => {
    const url = `http://192.168.1.49:2000/requestNoAuth`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
      });
      const cookie = response.headers.get('Set-Cookie');
      return cookie;
    } catch (error) {
      console.error('There was an error!', error);
    }
  }

  const handleSubmit = async (values, { resetForm }) => {
    const url = `http://192.168.1.49:2000/login`;
    console.log(values)
  
    values.username = values.username.trim();
    values.password = values.password.trim();
  
    try {
      const noAuthCookie = await getNoAuthCookie();
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': noAuthCookie,
        },
        body: JSON.stringify(values),
        credentials: 'include',
      });
  
      if (response.status === 200) {
        const token = response.headers.get('Authorization').split(' ')[1]; 
        const userTypeToken = response.headers.get('User-Type').split(' ')[1]; // Get userTypeToken
        setToken(token);
        await storeToken(token);
        await AsyncStorage.setItem('@userTypeToken', userTypeToken); // Store userTypeToken
        console.log('token recibido: ', token);
        console.log('userTypeToken recibido: ', userTypeToken);
        if (typeof onLogin === 'function') {
          onLogin();
        }
        resetForm();
      }
    } 
    catch (error) {
      console.error('There was an error!', error);
    }
  };

  const handleLogOut = async () => {
    setIsAuthenticated(false);
  }

  return (
    <Formik
      initialValues={{ username: '', password: '' }}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors }) => (
        <View style={styles.container}>
          <Text style={styles.title}>Iniciar sesión</Text>
          <TextInput
            style={styles.input}
            name="username"
            placeholder="Usuario"
            onChangeText={handleChange('username')}
            onBlur={handleBlur('username')}
            value={values.username}
          />
          {errors.username && <Text>{errors.username}</Text>}
          <TextInput
            style={styles.input}
            name="password"
            placeholder="Contraseña"
            secureTextEntry
            onChangeText={handleChange('password')}
            onBlur={handleBlur('password')}
            value={values.password}
          />
          {errors.password && <Text>{errors.password}</Text>}
          <View style={styles.buttonContainer}>
            <Text style={styles.buttonText} onPress={handleSubmit}>Iniciar sesión</Text>
          </View>
          <TouchableOpacity onPress={handleRegister}>
            <Text style={styles.buttonText}>Registrarse</Text>
          </TouchableOpacity>
        </View>
      )}
    </Formik>
  );
}

export default LogIn;