import React, { useState } from 'react';
import axios from 'axios';
import MapPage from './MapPage';

function MainPage() {
  const userId = 'your-user-id'; // replace with your user id
  const [locations, setLocations] = useState([]);

  const fetchLocations = () => {
    return axios.get('http://localhost:3000/markers')
      .then(response => {
        return response.data;
      }).catch(error => {
        console.error('Error getting markers: ', error);
      });
  };

  return (
    <div className="main-container">
      <h1>Plataforma principal</h1>
      <div className="map-container">
        <MapPage userId={userId} fetchLocations={fetchLocations} />
      </div>
      <button onClick={fetchLocations}>Search</button>
    </div>
  );
}

export default MainPage;