import React from 'react';
import MapPage from './MapPage';

function MainPage({ onLogout }) {
  return (
    <div className="main-container">
      <h1>Plataforma principal</h1>
      <button onClick={onLogout}>Cerrar sesión</button>
      <div className="map-container">
        <MapPage />
      </div>
    </div>
  );
}

export default MainPage;