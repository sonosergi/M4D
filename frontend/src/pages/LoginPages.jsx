import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', phoneNumber: '' });
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  axios.defaults.withCredentials = true;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    if (!form.username || !form.password || (!isLogin && !form.phoneNumber)) {
      setError('Por favor, rellene todos los campos');
      return;
    }
  
    const url = `http://localhost:4000/${isLogin ? 'login' : 'register'}`;
  
    try {
      const response = await axios.post(url, form);
      console.log(response.data);
      // Si el inicio de sesión es exitoso, guarda el token JWT en el almacenamiento local
      if (response.status === 200) {
        localStorage.setItem('jwt', response.data.token);
        onLogin();
        navigate('/main');
      }
    } 
    catch (error) {
      if (error.response) {
        setError('Error: ' + error.response.data);
      } else {
        setError('Error: ' + error.message);
      }
    }
  };

  return (
    <div className="login-container">
      <h1>{isLogin ? 'Iniciar sesión' : 'Registrarse'}</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        <input type="text" name="username" placeholder="Usuario o Teléfono" onChange={handleChange} />
        <input type="password" name="password" placeholder="Contraseña" onChange={handleChange} />
        {!isLogin && <input type="text" name="phoneNumber" placeholder="Phone Number" onChange={handleChange} />}
        <button type="submit">{isLogin ? 'Iniciar sesión' : 'Registrarse'}</button>
      </form>
      {error && <p className="error-message">{error}</p>}
      <button onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? '¿No tienes una cuenta? Regístrate' : '¿Ya tienes una cuenta? Inicia sesión'}
      </button>
    </div>
  );
}

export default LoginPage;