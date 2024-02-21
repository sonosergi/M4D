import React, { useCallback, useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import styles from './styles/LoginCustomStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { gql, useApolloClient } from '@apollo/client';

const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      sessionToken
      userTypeToken
      userIdToken
    }
  }
`;

const validationSchema = Yup.object().shape({
  username: Yup.string().required('Por favor, rellene todos los campos'),
  password: Yup.string().required('Por favor, rellene todos los campos'),
});

function LogIn({ onLogin }) {
  const navigation = useNavigation();
  const [loginError, setLoginError] = useState(null);
  const client = useApolloClient();

  const getNoAuthCookie = useCallback(async () => {
    const url = `http://192.168.1.49:7575/requestNoAuth`; // Make sure this URL is accessible from your device/emulator
    try {
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const cookie = response.headers.get('Authorization')?.split(' ')[1];
      return cookie || '';
    } catch (error) {
      console.error('Error obtaining temporary cookie:', error);
      return '';
    }
  }, []);

  const handleLogin = useCallback(async (values) => {
    try {
      const noAuthCookie = await getNoAuthCookie();
      if (!noAuthCookie) {
        throw new Error('No authorization cookie received');
      }
      const { data } = await client.mutate({
        mutation: LOGIN_MUTATION,
        variables: {
          username: values.username.trim(),
          password: values.password.trim(),
        },
        context: {
          headers: {
            Authorization: `Bearer ${noAuthCookie}`,
          },
        },
      });
  
      if (data && data.login && data.login.sessionToken && data.login.userTypeToken) {
        handleLoginSuccess(data.login.sessionToken, data.login.userTypeToken, data.login.userIdToken);
      }
    } catch (error) {
      console.error('Error during login:', error.message);
      setLoginError('Error de inicio de sesión. Por favor, inténtelo de nuevo.');
    }
  }, [getNoAuthCookie, client]);
  
  const handleLoginSuccess = useCallback(async (sessionToken, userTypeToken, userIdToken) => {
    try {
      // Store session token securely
      await storeToken('@secureSessionToken', sessionToken);
      await storeToken('@secureUserTypeToken', userTypeToken);
      await storeToken('@secureUserIdToken', userIdToken);
      console.log('secureSessionToken:', sessionToken);
      console.log('secureUserTypeToken:', userTypeToken);
      console.log('secureUserIdToken:', userIdToken);
  
      if (typeof onLogin === 'function') {
        onLogin();
      }
  
      if (navigation) {
        navigation.navigate('Map');
      }
    } catch (error) {
      console.error('Error storing tokens:', error);
    }
  }, [onLogin, navigation]);
  
  const storeToken = useCallback(async (key, value) => {
    try {
      // Use a more secure key and consider encryption
      await AsyncStorage.setItem(key, value);
      console.log('Token stored:', value);
    } catch (e) {
      console.error('Error storing token:', e);
    }
  }, []);

  return (
    <Formik
      initialValues={{ username: '', password: '' }}
      onSubmit={handleLogin}
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
          {loginError && <Text>{loginError}</Text>}
          <View style={styles.buttonContainer}>
            <Text style={styles.buttonText} onPress={handleSubmit}>Iniciar sesión</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.buttonText}>Registrarse</Text>
          </TouchableOpacity>
        </View>
      )}
    </Formik>
  );
}

export default LogIn;