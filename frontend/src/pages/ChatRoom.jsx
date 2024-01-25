import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios'; // Import axios

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
  const [username, setUsername] = useState('');
  const [usernameSet, setUsernameSet] = useState(false);
  const [userColors, setUserColors] = useState({});
  const [isUsersListVisible, setIsUsersListVisible] = useState(false);
  const socketRef = useRef();
  const messagesEndRef = useRef();
  const colors = generateRandomColors(8);

  useEffect(() => {
    axios.get('http://localhost:7000', { withCredentials: true }) 
      .then(response => {
        if (response.status === 200) {
          socketRef.current = io.connect('ws://localhost:7000', {
            withCredentials: true
          });

          socketRef.current.emit('joinRoom', roomId);

          socketRef.current.on('message', message => {
            if (!userColors[message.user]) {
              setUserColors(colors => ({...colors, [message.user]: colors[Math.floor(Math.random() * colors.length)]}));
            }
            setMessages(messages => [...messages, message]);
          });

          socketRef.current.on('users', users => {
            setUsers(users);
          });

          return () => {
            socketRef.current.disconnect();
          };
        } else {
          console.log('No token provided');
        }
      })
      .catch(error => {
        console.log('Error: ', error);
      });
  }, [roomId]);

  const sendMessage = event => {
    event.preventDefault();
    if (input !== '') {
      socketRef.current.emit('message', { text: input, user: username, roomId }); // Add roomId
      setInput('');
    }
  };

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handleUsernameSubmit = (event) => {
    event.preventDefault();
    if (username.trim() !== '') {
      socketRef.current.emit('usernameSet', username);
      setUsernameSet(true);
    }
  };

  const toggleUsersList = () => {
    setIsUsersListVisible(!isUsersListVisible);
  };

  if (!usernameSet) {
    return (
      <div>
        <h3>Choose a username to join the chat room.</h3>
        <form onSubmit={handleUsernameSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={username}
            onChange={handleUsernameChange}
            required
          />
          <br />
          <input type="submit" value="Join" />
        </form>
      </div>
    );
  } else {
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
  }
};

export default ChatRoom;