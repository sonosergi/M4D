import React from 'react';
import axios from 'axios';

function CreateRoom({ userId, locations }) {
  const createChatRoom = (locationId) => {
    const roomName = window.prompt('Enter room name');
    if (roomName) {
      axios.post('http://localhost:7000/chat_rooms', {
        user_id: userId,
        roomName: roomName,
        locationId: locationId,
      }).then(() => {
        alert('Chat room created');
      }).catch(error => {
        console.error('Error creating chat room: ', error);
      });
    }
  };

  return (
    <div>
      {locations.map(location => (
        <div key={location.id} onClick={() => createChatRoom(location.id)}>
          <p>Lat: {location.lat}, Lng: {location.lng}</p>
        </div>
      ))}
    </div>
  );
}

export default CreateRoom;