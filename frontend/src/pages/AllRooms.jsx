import React from 'react';
import { Link } from 'react-router-dom';

function AllRooms() {
  const rooms = ['room1', 'room2', 'room3']; // Reemplaza esto con la lógica para obtener las salas

  return (
    <div>
      <h1>All Rooms</h1>
      {rooms.map(room => (
        <p key={room}>
          <Link to={`/room/${room}`}>{room}</Link>
        </p>
      ))}
    </div>
  );
}

export default AllRooms;