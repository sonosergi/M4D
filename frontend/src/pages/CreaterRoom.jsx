import React, { useState } from 'react'; // Import useState
import axios from 'axios';

const CreateRoom = ({ lat, lng, closeModal, roomName, setRoomName }) => { 
  const [description, setDescription] = useState(''); // Define description and setDescription

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('http://localhost:7000/chat_rooms', 
        { roomName, lat, lng }, 
        { 
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );

      console.log(response.data);

      // Make a second axios.post call to create a post
      const postResponse = await axios.post('http://localhost:10000/post', 
        { roomName, description, lat, lng }, // Use description here
        { 
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );

      console.log(postResponse.data);

      closeModal();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={roomName} onChange={(e) => setRoomName(e.target.value)} required />
      <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" required /> {/* Use description here */}
      <button type="submit">Create Room</button>
    </form>
  );
};

export default CreateRoom;