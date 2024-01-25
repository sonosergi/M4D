import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

const generateRandomColors = count => {
  const colors = [];
  const saturation = 100;
  const lightness = 50;

  for (let i = 0; i < count; i++) {
    const hue = Math.floor(Math.random() * 361);
    const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    colors.push(color);
  }

  return colors;
};

const ChatRoom = ({ roomId }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [input, setInput] = useState('');
  const [userColors, setUserColors] = useState({});
  const [isUsersListVisible, setIsUsersListVisible] = useState(false);
  const socketRef = useRef();
  const messagesEndRef = useRef();
  const colors = generateRandomColors(8);
  
  useEffect(() => {
    const socket = io.connect(`http://localhost:7000`, {
      withCredentials: true
    });
  
    socketRef.current = socket;
  
    socket.emit('joinRoom', roomId);
  
    socket.on('message', message => {
      console.log('Received message:', message); // Add this line
      if (!userColors[message.user]) {
        setUserColors(colors => ({...colors, [message.user]: colors[Math.floor(Math.random() * colors.length)]}));
      }
      setMessages(messages => {
        console.log('Updating messages state:', [...messages, message]); // Add this line
        return [...messages, message];
      });
    });
  
    socket.on('users', users => {
      setUsers(users);
    });
  
    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  const sendMessage = event => {
    event.preventDefault();
    if (input !== '') {
      socketRef.current.emit('message', roomId, input); // Change this line
      console.log('Sent message:', { message: input, roomId }); 
      setInput('');
    }
  };

  const toggleUsersList = () => {
    setIsUsersListVisible(!isUsersListVisible);
  };

  return (
    <div>
      <h1>Room: {roomId}</h1>
      <button onClick={toggleUsersList}>
        {isUsersListVisible ? "Hide user list" : `Users (${users.length})`}
      </button>
      {isUsersListVisible && users.map((user, index) => (
        <p key={index} style={{color: userColors[user]}}>{user}</p>
      ))}
      <form onSubmit={sendMessage}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button>Send</button>
      </form>
      <h2>Messages:</h2>
      {messages.map((message, index) => (
        <p key={index} style={{color: userColors[message.user]}}>
          <strong>{message.user}: </strong>
          {message.text}
        </p>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatRoom;