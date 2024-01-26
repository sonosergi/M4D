// ChatMessages.jsx
import React from 'react';

const ChatMessages = ({ messages, userColors }) => (
  <div>
    <h2>Messages:</h2>
    {messages.map((message, index) => (
      <p key={index} style={{color: userColors[message.user]}}>
        <strong>{message.user}: </strong>
        {message.text}
      </p>
    ))}
  </div>
);

export default ChatMessages;