import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import styles from './styles/LoginCustomStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useMutation, gql } from '@apollo/client';

const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      sessionToken
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
  const [login, { data, loading }] = useMutation(LOGIN_MUTATION);

  useEffect(() => {
    if (data && data.login && data.login.sessionToken) {
      handleLoginSuccess(data.login.sessionToken);
    }
  }, [data]);

  const getNoAuthCookie = async () => {
    const url = `http://192.168.1.49:7575/requestNoAuth`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response) {
        throw new Error('No response received');
      }
      const cookie = response.headers.get('Authorization')?.split(' ')[1];
      return cookie || '';
    } catch (error) {
      console.error('Error obtaining temporary cookie:', error);
      return '';
    }
  };

  const handleLoginSuccess = async (sessionToken) => {
    try {
      // Store session token securely
      await storeToken(sessionToken);

      if (typeof onLogin === 'function') {
        onLogin();
      }

      if (navigation) {
        navigation.navigate('Map');
      }
    } catch (error) {
      console.error('Error storing session token:', error);
    }
  };

  const storeToken = async (value) => {
    try {
      // Use a more secure key and consider encryption
      await AsyncStorage.setItem('@secureSessionToken', value);
      console.log('Session token stored:', value);
    } catch (e) {
      console.error('Error storing session token:', e);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const noAuthCookie = await getNoAuthCookie();
      const response = await login({
        variables: {
          ...values,
          username: values.username.trim(),
          password: values.password.trim(),
        },
        context: {
          headers: {
            Authorization: `Bearer ${noAuthCookie}`,
          },
        },
      });

      if (response.errors && response.errors.length > 0) {
        setLoginError(response.errors[0].message);
      } else {
        setLoginError(null);
      }
    } catch (error) {
      console.error('Error during login:', error.message);
      setLoginError('Error de inicio de sesión. Por favor, inténtelo de nuevo.');
    }
  };

  if (loading) return <Text>Loading...</Text>;

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
