// ChatInput.jsx
import React, { useState } from 'react';

const ChatInput = ({ sendMessage }) => {
  const [input, setInput] = useState('');

  const handleSubmit = event => {
    event.preventDefault();
    if (input !== '') {
      sendMessage(input);
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Type a message..."
      />
      <button>Send</button>
    </form>
  );
};

export default ChatInput;