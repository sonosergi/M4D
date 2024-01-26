import React from 'react';
import io from 'socket.io-client';

class ChatRoom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      input: '',
      users: [],
      userColors: {},
      isUsersListVisible: false
    };
    this.socketRef = React.createRef();
    this.messagesEndRef = React.createRef();
    this.colors = this.generateRandomColors(8);
  }

  generateRandomColors(count) {
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

  componentDidMount() {
    const socket = io.connect(`http://localhost:7000`, {
      withCredentials: true
    });
  
    this.socketRef.current = socket;
  
    socket.emit('joinRoom', this.props.roomId);
  
    socket.on('message', message => {
      if (!this.state.userColors[message.user]) {
        this.setState(state => ({ userColors: {...state.userColors, [message.user]: this.colors[Math.floor(Math.random() * this.colors.length)]} }));
      }
      this.setState(state => ({ messages: [...state.messages, message] }));
    });
  
    socket.on('users', users => {
      this.setState({ users });
    });
    
    socket.on('messages', messages => {
      this.setState({ messages });
    });
  
    // Emit the 'getUsers' and 'getMessages' events after joining the room
    socket.emit('getUsers');
    socket.emit('getMessages');
  }

  componentWillUnmount() {
    this.socketRef.current.disconnect();
  }

  sendMessage = event => {
    event.preventDefault();
    if (this.state.input !== '') {
      this.socketRef.current.emit('message', this.props.roomId, this.state.input);
      console.log(this.state.input);
      this.setState({ input: '' });
      console.log(this.state.input);
    }
  };

  toggleUsersList = () => {
    this.setState(prevState => ({ isUsersListVisible: !prevState.isUsersListVisible }));
    console.log(this.state.isUsersListVisible);
  };

  render() {
    return (
      <div>
        <h1>Room: {this.props.roomId}</h1>
        <button onClick={this.toggleUsersList}>
          {this.state.isUsersListVisible ? "Hide user list" : `Users (${this.state.users.length})`}
        </button>
        {this.state.isUsersListVisible && this.state.users.map((user, index) => (
          <p key={index} style={{color: this.state.userColors[user]}}>{user}</p>
        ))}
        <form onSubmit={this.sendMessage}>
          <input
            value={this.state.input}
            onChange={e => this.setState({ input: e.target.value })}
            placeholder="Type a message..."
          />
          <button>Send</button>
        </form>
        <h2>Messages:</h2>
        {this.state.messages.map((message, index) => (
          <p key={index} style={{color: this.state.userColors[message.user]}}>
            <strong>{message.user}: </strong>
            {message.text}
          </p>
        ))}
        <div ref={this.messagesEndRef} />
      </div>
    );
  }
}

export default ChatRoom;