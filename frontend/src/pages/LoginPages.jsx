import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', phoneNumber: '' });
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

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
      // Si el inicio de sesión es exitoso, llama a la función onLogin y navega a /main
      if (response.status === 200) {
        onLogin();
        navigate('/main');
      }
    } catch (error) {
      setError('Error: ' + error.response.data);
    }
  };

  return (
    <div>
      <h1>{isLogin ? 'Iniciar sesión' : 'Registrarse'}</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" name="username" placeholder="Username" onChange={handleChange} />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} />
        {!isLogin && <input type="text" name="phoneNumber" placeholder="Phone Number" onChange={handleChange} />}
        <button type="submit">{isLogin ? 'Iniciar sesión' : 'Registrarse'}</button>
      </form>
      {error && <p>{error}</p>}
      <button onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? '¿No tienes una cuenta? Regístrate' : '¿Ya tienes una cuenta? Inicia sesión'}
      </button>
    </div>
  );
}

export default LoginPage;