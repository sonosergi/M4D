import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import MapPage from './MapPage';
import ChatRoom from './ChatRoom';
import CreateRoom from './CreaterRoom';


function MainPage({ onLogout }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [roomName, setRoomName] = useState('');
  const [showLocations, setShowLocations] = useState(false);
  const [showRooms, setShowRooms] = useState(false);

  const toggleLocations = () => {
    setShowLocations(!showLocations);
    setShowModal(false); // Esta línea hace que el modal desaparezca
  };  const toggleRooms = () => setShowRooms(!showRooms);

  return (
    <div className="main-container">
      <div className="menu-bar">
        <h1> M4D </h1>
        <button className="search-button" onClick={toggleLocations}>Search</button>
        {showModal && <CreateRoom lat={selectedLocation?.lat} lng={selectedLocation?.lng} closeModal={() => setShowModal(false)} roomName={roomName} setRoomName={setRoomName} />}
        <button className="logout-button" onClick={onLogout}>Cerrar sesión</button>
      </div>
      <div className="map-container">
        <Routes>
          <Route path="/" element={<MapPage showLocations={showLocations} showRooms={showRooms} setShowModal={setShowModal} setSelectedLocation={setSelectedLocation} />} />
          <Route path="chat/:roomId" element={<ChatRoom />} />
        </Routes>
      </div>
      <div className="bottom-section">
        <button className="rooms-button" onClick={toggleRooms}>All Rooms</button>
      </div>
    </div>
  );
}

export default MainPage;