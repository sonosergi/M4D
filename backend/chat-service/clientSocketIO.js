import io from 'socket.io-client';

class SocketClient {
  constructor(url) {
    this.socket = io(url);
    this.initialize();
  }

  initialize() {
    this.socket.on('connect', this.handleConnect.bind(this));
    this.socket.on('userConnected', this.handleUserConnected.bind(this));
    this.socket.on('disconnect', this.handleDisconnect.bind(this));
    this.socket.on('connect_error', this.handleConnectionError.bind(this));
  }

  handleConnect() {
    console.log('Conectado!');
  }

  handleUserConnected(id) {
    console.log('Usuario conectado:', id);
  }

  handleDisconnect() {
    console.log('Desconectado');
  }

  handleConnectionError(error) {
    console.error('Error de conexión:', error);
  }
}

// Uso
SocketClient('http://localhost:3200/connect/salatest122');

