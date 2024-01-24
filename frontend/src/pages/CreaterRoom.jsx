import React from 'react';
import axios from 'axios';

const CreateRoom = ({ locationId, closeModal, roomName, setRoomName }) => { // Recibimos roomName y setRoomName como props

  const handleSubmit = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem('token');

    try {
      const response = await axios.post('http://localhost:7000/chat_rooms', 
        { roomName, locationId },
        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } }
      );

      console.log(response.data);
      closeModal();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={roomName} onChange={(e) => setRoomName(e.target.value)} required />
      <button type="submit">Create Room</button>
    </form>
  );
};

export default CreateRoom;