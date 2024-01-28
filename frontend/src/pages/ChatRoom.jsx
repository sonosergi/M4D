import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom';
import './ChatRoom.css';

function generateRandomColors(count) {
  const colors = [];
  const saturation = 100;
  const lightness = 50;

  for (let i = 0; i < count; i++) {
    const hue = Math.floor(Math.random() * 361);
    const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    colors.push(color);
  }

  return colors;
}

function ChatRoom() {
  const { roomId } = useParams();
  const [roomName, setRoomName] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [users, setUsers] = useState([]);
  const [userColors, setUserColors] = useState({});
  const [isUsersListVisible, setIsUsersListVisible] = useState(false);
  const socketRef = useRef();
  const messagesEndRef = useRef();
  const colors = generateRandomColors(8);

  useEffect(() => {
    const socket = io.connect(`http://localhost:7000`, {
      withCredentials: true
    });
  
    socket.on('roomInfo', (roomInfo) => {
      console.log('Received roomInfo:', roomInfo);
      if (roomInfo && roomInfo.room_name) {
        setRoomName(roomInfo.room_name);
      } else {
        console.error('Invalid roomInfo:', roomInfo);
      }
    });
  
    socketRef.current = socket;
  
    socket.on('connect', () => {
      console.log('Connected to server');
      socket.emit('joinRoom', roomId);
      socket.emit('getMessages', roomId);
    });
    
    socket.on('ready', () => {
      socket.emit('getUsers', roomId); 
    });

    socket.on('users', users => {
      console.log('Received users:', users);
      if (Array.isArray(users)) {
        setUsers(users);
        setUserColors(prevColors => {
          const newColors = { ...prevColors };
          users.forEach(user => {
            if (!newColors[user.username]) {
              newColors[user.username] = colors[Object.keys(newColors).length % colors.length];
            }
          });
          return newColors;
        });
      } else {
        console.error('Invalid users:', users);
      }
    });

    socket.on('message', message => {
      console.log('Received message:', message);
      if (message && message.user && message.text) {
        setUserColors(prevColors => {
          const newColors = { ...prevColors };
          if (!newColors[message.user]) {
            newColors[message.user] = colors[Object.keys(newColors).length % colors.length];
          }
          setMessages(state => [...state, {...message, color: newColors[message.user]}]);
          return newColors;
        });
      } else {
        console.error('Invalid message:', message);
      }
    });
  
    setTimeout(() => {
      if (roomName === '') {
        console.log('No roomInfo received, requesting roomInfo');
        socket.emit('getRoomInfo', roomId);
      }
    }, 5000);
  
    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  const sendMessage = (event) => {
    event.preventDefault();
    if (input !== '') {
      socketRef.current.emit('message', roomId, input);
      setInput('');
    }
  };

  const toggleUsersList = () => {
    setIsUsersListVisible(prevState => !prevState);
  };

  return (
    <div className="chat-room">
      <div>
        <h1>{roomName}</h1>
        <button onClick={toggleUsersList} className="toggle-users">
          {isUsersListVisible ? "Hide user list" : `Users (${users.length})`}
        </button>
        {isUsersListVisible && users.map((user, index) => (
          <p key={index} className="user" style={{ color: userColors[user.username] }}>{user.username}</p>
        ))}
        <h2>Messages:</h2>
        {messages.map((message, index) => (
          <div key={index} className="message">
            <h2 style={{ color: message.color }}>{message.user}: {message.text}</h2>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="message-form">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          className="message-input"
        />
        <button className="send-button">Send</button>
      </form>
    </div>
  );
}

export default ChatRoom;