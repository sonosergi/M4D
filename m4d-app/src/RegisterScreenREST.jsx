import React from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as yup from 'yup';
import { useFormik } from 'formik';
import { TextInput, Button, Text, HelperText, Menu, Divider, Provider } from 'react-native-paper';

function RegisterScreen({ onLogin }) {
  const navigation = useNavigation();
  const [visible, setVisible] = React.useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const getNoAuthCookie = async () => {
    const url = `http://192.168.1.49:7575/requestNoAuth`;
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
    const url = `http://192.168.1.49:4000/register`;
  
    values.username = values.username.trim();
    values.password = values.password.trim();
    values.phoneNumber = values.phoneNumber.trim();
    values.email = values.email.trim();
    values.type = values.type.trim();
  
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
        if (typeof onLogin === 'function') {
          onLogin();
        }
        resetForm();
        navigation.navigate('Map');
      }
    } 
    catch (error) {
      formik.setErrors({ general: 'Error: ' + error.message });
      console.error('There was an error!', error);
    }
  };

  const formik = useFormik({
    initialValues: { username: '', password: '', confirmPassword: '', phoneNumber: '', email: '', type: 'personal' },
    validationSchema: yup.object().shape({
      username: yup.string().required('Required'),
      password: yup.string().required('Required'),
      confirmPassword: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match').required('Required'),
      phoneNumber: yup.string().required('Required'),
      email: yup.string().email('Invalid email').required('Required'),
      type: yup.string().oneOf(['personal', 'professional'], 'Invalid type'),
    }),
    onSubmit: handleSubmit,
  });

  return (
    <Provider>
      <View>
        <Text>Registrarse</Text>
        <TextInput
          label="Username"
          onChangeText={formik.handleChange('username')}
          value={formik.values.username}
          onBlur={formik.handleBlur('username')}
        />
        <HelperText type="error" visible={formik.touched.username && formik.errors.username}>
          {formik.errors.username}
        </HelperText>
        <TextInput
          label="Contraseña"
          secureTextEntry
          onChangeText={formik.handleChange('password')}
          value={formik.values.password}
          onBlur={formik.handleBlur('password')}
        />
        <HelperText type="error" visible={formik.touched.password && formik.errors.password}>
          {formik.errors.password}
        </HelperText>
        <TextInput
          label="Confirmar Contraseña"
          secureTextEntry
          onChangeText={formik.handleChange('confirmPassword')}
          value={formik.values.confirmPassword}
          onBlur={formik.handleBlur('confirmPassword')}
        />
        <HelperText type="error" visible={formik.touched.confirmPassword && formik.errors.confirmPassword}>
          {formik.errors.confirmPassword}
        </HelperText>
        <TextInput
          label="Phone Number"
          onChangeText={formik.handleChange('phoneNumber')}
          value={formik.values.phoneNumber}
          onBlur={formik.handleBlur('phoneNumber')}
        />
        <HelperText type="error" visible={formik.touched.phoneNumber && formik.errors.phoneNumber}>
          {formik.errors.phoneNumber}
        </HelperText>
        <TextInput
          label="Email"
          onChangeText={formik.handleChange('email')}
          value={formik.values.email}
          onBlur={formik.handleBlur('email')}
        />
        <HelperText type="error" visible={formik.touched.email && formik.errors.email}>
          {formik.errors.email}
        </HelperText>
        <Menu
          visible={visible}
          onDismiss={closeMenu}
          anchor={<Button onPress={openMenu}>{formik.values.type || 'Type (personal or professional)'}</Button>}
        >
          <Menu.Item onPress={() => {formik.setFieldValue('type', 'personal'); closeMenu();}} title="Personal" />
          <Divider />
          <Menu.Item onPress={() => {formik.setFieldValue('type', 'professional'); closeMenu();}} title="Professional" />
        </Menu>
        <HelperText type="error" visible={formik.touched.type && formik.errors.type}>
          {formik.errors.type}
        </HelperText>
        <Button mode="contained" onPress={formik.handleSubmit}>Registrarse</Button>
        <HelperText type="error" visible={formik.errors.general}>
          {formik.errors.general}
        </HelperText>
      </View>
    </Provider>
  );
}

export default RegisterScreen;