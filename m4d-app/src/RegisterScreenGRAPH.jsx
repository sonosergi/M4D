import React, { useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as yup from 'yup';
import { useFormik } from 'formik';
import { TextInput, Button, Text, HelperText, Menu, Divider, Provider } from 'react-native-paper';
import { useMutation, gql } from '@apollo/client';

const REGISTER_MUTATION = gql`
  mutation Register($username: String!, $password: String!, $phoneNumber: String!, $type: String!) {
    register(username: $username, password: $password, phoneNumber: $phoneNumber, type: $type) {
      username
    }
  }
`;

const RegisterScreen = ({ onLogin }) => {
  const navigation = useNavigation();
  const [visible, setVisible] = useState(false);
  const [register, { data, loading, error }] = useMutation(REGISTER_MUTATION);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const getNoAuthCookie = async () => {
    const url = `http://192.168.1.49:7575/requestNoAuth`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
      });
      const cookie = response.headers.get('Authorization').split(' ')[1];
      return cookie;
    } catch (error) {
      console.error('There was an error!', error);
    }
  }

  const handleSubmit = async (values, { resetForm }) => {
    const trimmedValues = {
      ...values,
      type: values.type.trim(),
      phoneNumber: values.phoneNumber.trim(),
      username: values.username.trim(),
      password: values.password.trim(),
    };
    console.log(values)
  
    const noAuthCookie = await getNoAuthCookie();
    console.log(noAuthCookie)

    try {
      const response = await register({ 
        variables: trimmedValues,
        context: {
          headers: {
            Authorization: `Bearer ${noAuthCookie}`,
          },
        },
      });
  
      // Make sure data is defined before accessing its property
      if (response.data && response.data.register) {
        onLogin?.();
        resetForm();
        navigation.navigate('Map');
      }
      console.log(response.data && response.data.register)
    } catch (error) {
      formik.setErrors({ general: 'Error: ' + error.message });
      console.error('There was an error!', error);
    }
  };

  const formik = useFormik({
    initialValues: { username: '', password: '', confirmPassword: '', phoneNumber: '', type: 'personal' },
    validationSchema: yup.object().shape({
      username: yup.string().required('Required'),
      password: yup.string().required('Required'),
      confirmPassword: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match').required('Required'),
      phoneNumber: yup.string().required('Required'),
      type: yup.string().oneOf(['personal', 'professional'], 'Invalid type'),
    }),
    onSubmit: handleSubmit,
  });

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error! {error.message}</Text>;

  return (
    <Provider>
      <View>
        <FormInput label="Username" name="username" formik={formik} />
        <FormInput label="Contraseña" name="password" formik={formik} secureTextEntry />
        <FormInput label="Confirmar Contraseña" name="confirmPassword" formik={formik} secureTextEntry />
        <FormInput label="Phone Number" name="phoneNumber" formik={formik} />
        <TypeMenu visible={visible} openMenu={openMenu} closeMenu={closeMenu} formik={formik} />
        <Button mode="contained" onPress={formik.handleSubmit}>Registrarse</Button>
        <HelperText type="error" visible={formik.errors.general}>
          {formik.errors.general}
        </HelperText>
      </View>
    </Provider>
  );
}

const FormInput = ({ label, name, formik, ...props }) => (
  <>
    <TextInput
      label={label}
      onChangeText={formik.handleChange(name)}
      value={formik.values[name]}
      onBlur={formik.handleBlur(name)}
      {...props}
    />
    <HelperText type="error" visible={formik.touched[name] && formik.errors[name]}>
      {formik.errors[name]}
    </HelperText>
  </>
);

const TypeMenu = ({ visible, openMenu, closeMenu, formik }) => (
  <Menu
    visible={visible}
    onDismiss={closeMenu}
    anchor={<Button onPress={openMenu}>{formik.values.type || 'Type (personal or professional)'}</Button>}
  >
    <Menu.Item onPress={() => {formik.setFieldValue('type', 'personal'); closeMenu();}} title="Personal" />
    <Divider />
    <Menu.Item onPress={() => {formik.setFieldValue('type', 'professional'); closeMenu();}} title="Professional" />
  </Menu>
);

export default RegisterScreen;