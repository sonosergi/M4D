import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { validateUser } from './middlewares/validateUser.js';
import cors from 'cors';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const allowedOrigins = ['http://localhost:5173'];

const app = express();
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg = 'The CORS policy for this site does not ' +
        'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());
app.use(validateUser);
app.use('/live', express.static('public'));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg = 'The CORS policy for this site does not ' +
          'allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST"],
    credentials: true
  },
  maxHttpBufferSize: 1e8
});

io.use((socket, next) => {
  if (socket.request.headers.cookie) {
    const cookies = cookie.parse(socket.request.headers.cookie);
    const token = cookies['token'];
    console.log(token);
    if (token) {
      jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if (err) {
          next(new Error('Invalid token'));
        } else {
          socket.userId = user.id;
          next();
        }
      });
    } else {
      next(new Error('Authentication error'));
    }
  } else {
    next(new Error('Authentication error'));
  }
});

const peers = new Map();

io.on('connection', (socket) => {
  console.log('Usuario conectado');

  let streamId = uuidv4();
  const filePath = `public/${streamId}.webm`;
  let writeStream;

  try {
    writeStream = fs.createWriteStream(filePath, { flags: 'a' });
    writeStream.on('open', () => {
      console.log(`writeStream abierto para el archivo ${filePath}`);
    });
    writeStream.on('error', (error) => {
      handleError(error, 'Error en writeStream', socket);
    });
  } catch (error) {
    handleError(error, 'Error al crear writeStream', socket);
    return;
  }

  socket.binaryType = 'arraybuffer';

  socket.on('webrtc-signal', (data) => {
    const { targetSocketId, offer, signal } = data;

    if (offer) {
      peers[targetSocketId] = socket;
    }

    if (targetSocketId && peers[targetSocketId]) {
      peers[targetSocketId].emit('webrtc-signal', { signal, offer, streamId: socket.id });
    }
  });

  socket.on('stream-data', (data) => {
    // Asegúrate de que el streamId se está enviando con los datos
    if (!data.streamId) {
      data.streamId = streamId;
    }
    streamData(data, socket, writeStream);
    socket.emit('stream-data', { streamId: data.streamId, chunk: data.chunk });
  });

  socket.on('request-video', (requestStreamId) => {
    console.log('Solicitud de video recibida', requestStreamId);
    const filePath = `public/${requestStreamId}.webm`;
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error(`El archivo ${filePath} no existe`);
        socket.emit('error', 'El video solicitado no existe');
      } else {
        const readStream = fs.createReadStream(filePath);
        readStream.on('error', (error) => {
          console.error(`Error al leer el archivo ${filePath}`, error);
          socket.emit('error', 'Error al enviar el video');
        });

        // Use socket.emit for sending chunks to the client
        readStream.on('data', (chunk) => {
          socket.emit('video-chunk', { streamId: requestStreamId, chunk });
          console.log('Enviando video', chunk.length)
        });

        readStream.on('end', () => {
          console.log('Video enviado');
        });
      }
    });
  });

  function streamData(data, socket, writeStream) {
    console.log('Datos recibidos: ', data);
    if (writeStream && writeStream.writable) {
      try {
        const buffer = Buffer.from(data.chunk);
        console.log('Buffer creado: ', buffer);
        writeStream.write(buffer);
      } catch (error) {
        handleError(error, 'Error al escribir datos', socket);
      }
    } else {
      console.error('writeStream no está disponible o no es escribible');
      socket.emit('error', 'writeStream no está disponible o no es escribible');
    }
  }

  function handleError(error, errorMessage, socket) {
    console.error(`Error: ${errorMessage}`, error);
    socket.emit('error', errorMessage);
  }
});

const PORT = process.env.PORT || 3500;

httpServer.listen(PORT, () => {
  console.log(`Servidor de streaming en tiempo real escuchando en el puerto ${PORT}`);
});
