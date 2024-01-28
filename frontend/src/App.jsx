import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPages';
import MainPage from './pages/MainPage';
import ChatRoom from './pages/ChatRoom';
import './App.css'

function App() {
  const token = localStorage.getItem('jwt');
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <Routes>
        <Route path="/main/*" element={isLoggedIn ? <MainPage onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/main/chat/:roomId" element={isLoggedIn ? <ChatRoom /> : <Navigate to="/" />} />
        <Route path="/" element={<LoginPage onLogin={handleLogin} />} />
      </Routes>
    </Router>
  )
}

export default App;