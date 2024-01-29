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
  const [file, setFile] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isFileInputVisible, setIsFileInputVisible] = useState(false);



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

    socket.on('file', (fileArray, filename, username) => {
      const fileUint8Array = new Uint8Array(fileArray);
      const blob = new Blob([fileUint8Array], { type: 'auto' });
      const fileExtension = filename.split('.').pop();
      const fileUrl = URL.createObjectURL(blob);
      
      setUserColors(prevColors => {
        const newColors = { ...prevColors };
        if (!newColors[username]) {
          newColors[username] = colors[Object.keys(newColors).length % colors.length];
        }
        setMessages(messages => [...messages, { user: username, text: `${filename}`, fileUrl, fileExtension, color: newColors[username] }]);
        return newColors;
      });
      setTimeout(() => URL.revokeObjectURL(fileUrl), 20000); // 20 seconds
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const sendMessage = (event) => {
    event.preventDefault();
    setIsSending(true);
    if (input !== '') {
      socketRef.current.emit('message', roomId, input);
      setInput('');
    }
    if (file !== null) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const fileArrayBuffer = reader.result;
        console.log(fileArrayBuffer);
        socketRef.current.emit('file', roomId, fileArrayBuffer, file.name);
        setFile(null);
        setIsSending(false);
      };
      reader.readAsArrayBuffer(file);
    } else {
      setIsSending(false);
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const toggleUsersList = () => {
    setIsUsersListVisible(prevState => !prevState);
  };

  const toggleFileInput = () => {
    setIsFileInputVisible(prevState => !prevState);
  };

  return (
    <div className="chat-room">
      <div className="top-section">
        <h1>{roomName}</h1>
        <button onClick={toggleUsersList} className="toggle-users">
          {isUsersListVisible ? "Hide user list" : `Users (${users.length})`}
        </button>
        {isUsersListVisible && users.map((user, index) => (
          <p key={index} className="user" style={{ color: userColors[user.username] }}>{user.username}</p>
        ))}
      </div>
      <div className="middle-section">
        {messages.map((message, index) => (
          <div key={index} className="message">
            <h2 style={{ color: message.color }}>
              {message.user}:&nbsp;
              {message.fileUrl ? (
                <a href={message.fileUrl} download={message.text} style={{ color: message.color }}>{message.text}</a>
              ) : (
                <span>{message.text}</span>
              )}
            </h2>
            {message.fileUrl && (
              <div>
                {message.fileExtension === 'png' || message.fileExtension === 'jpg' || message.fileExtension === 'jpeg' || message.fileExtension === 'gif' ? (
                  <img src={message.fileUrl} alt={message.text} style={{ maxWidth: '300px' }} />
                ) : message.fileExtension === 'mp4' || message.fileExtension === 'webm' ? (
                  <video controls src={message.fileUrl} style={{ maxWidth: '300px' }} />
                ) : message.fileExtension === 'mp3' || message.fileExtension === 'wav' || message.fileExtension === 'ogg' ? (
                  <audio controls src={message.fileUrl} />
                ) : null}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} /> 
      </div>
      <div className="bottom-section">
        <form onSubmit={sendMessage} className="message-form">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="message-input"
          />
          {isFileInputVisible && <input type="file" onChange={handleFileChange} />}
          <button onClick={toggleFileInput} type="button">
            {isFileInputVisible ? 'Ocultar' : 'Adjuntar archivo'}
          </button>
          <button className="send-button" disabled={isSending}>Enviar</button>      
        </form>
      </div>
    </div>
  );
}

export default ChatRoom;