import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs'; 
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173'],
    methods: ["GET", "POST"],
    credentials: true,
    optionsSuccessStatus: 200
  },
  maxHttpBufferSize: 1e8
});

app.use('/live', express.static('public'));

io.on('connection', async (socket) => {
  console.log('Usuario conectado');

  let streamId = uuidv4();
  const filePath = `public/${streamId}.webm`;
  let writeStream;
  let childProcess;

  try {
    writeStream = fs.createWriteStream(filePath, { flags: 'a' }); // Cambio aquí
    writeStream.on('open', () => {
      console.log(`writeStream abierto para el archivo ${filePath}`);
    });
    writeStream.on('error', (error) => {
      handleError(error, 'Error en writeStream', childProcess, writeStream); // Cambio aquí
    });
  } catch (error) {
    handleError(error, 'Error al crear writeStream', childProcess, writeStream); // Cambio aquí
    return;
  }

  socket.binaryType = 'arraybuffer';

  socket.on('start-stream', startStream);
  socket.on('stream-data', streamData);
  socket.on('disconnect', disconnect);

  function startStream() {
    childProcess = spawnFFMPEGProcess(streamId);
    socket.emit('stream', { streamId });
  }

  function streamData(data) {
    console.log('Datos recibidos: ', data);
    if (writeStream && writeStream.writable) {
      try {
        const buffer = Buffer.from(data);
        console.log('Buffer creado: ', buffer);
        writeStream.write(buffer);
        if (childProcess && childProcess.stdin.writable) { // Asegúrate de que childProcess está definido
          childProcess.stdin.write(buffer);
        }
      } catch (error) {
        handleError(error, 'Error al escribir datos');
      }
    } else {
      console.error('writeStream no está disponible o no es escribible');
      socket.emit('error', 'writeStream no está disponible o no es escribible');
    }
  }

  function disconnect() {
    console.log('Usuario desconectado');
    if (childProcess) {
      endChildProcess();
    }
    if (writeStream && writeStream.writable) {
      writeStream.end();
    }
    if (streamId) {
      deleteMPDFile(streamId);
    }
  }
  
  function spawnFFMPEGProcess(streamId) {
    // Define the input and output paths
    const inputPath = `public/${streamId}.webm`;
    const outputPath = `public/${streamId}.mpd`;
  
    // Define the ffmpeg command
    const ffmpegCommand = [
      '-i', inputPath, // input file
      '-crf', '30', // set the Content Rate Factor
      '-preset', 'ultrafast', // provides for the fastest possible encoding
      '-acodec', 'aac', // sets the audio codec
      '-ar', '44100', // set the audio sample rate
      '-ac', '2', // specifies two channels of audio
      '-b:a', '96k', // sets the audio bit rate
      '-vcodec', 'libx264', // sets the video codec
      '-r', '25', // set the frame rate
      '-b:v', '500k', // set the video bit rate
      '-f', 'dash', // says to deliver the output stream in an dash wrapper
      outputPath // output file
    ];
  
    // Spawn the child process
    const childProcess = spawn('ffmpeg', ffmpegCommand, { stdio: ['pipe', 'pipe', 'pipe', 'ipc'] });
  
    childProcess.on('close', () => {
      // Cambia los permisos del archivo a 644 (propietario puede leer/escribir, grupo y otros pueden leer)
      fs.chmod(outputPath, 0o644, (err) => {
        if (err) throw err;
        console.log('Los permisos del archivo fueron cambiados');
      });
  
      deleteWebmFile(streamId);
    });
  
    return childProcess;
  }
});

function handleError(error, errorMessage, childProcess, writeStream) { // Cambio aquí
  console.error(`Error: ${errorMessage}`, error);
  if (childProcess) {
    endChildProcess(childProcess); // Cambio aquí
  }
  if (writeStream && writeStream.writable) {
    writeStream.end();
  }
  io.emit('error', errorMessage);
}

function endChildProcess(childProcess) { // Cambio aquí
  childProcess.stdin.end();
  childProcess.on('exit', (code, signal) => {
    console.log(`child process exited with code ${code} and signal ${signal}`);
  });
}

function deleteWebmFile(streamId) {
  const webmFilePath = `public/${streamId}.webm`;
  fs.unlink(webmFilePath, (err) => {
    if (err) {
      console.error(`Error al eliminar .webm file: ${err}`);
    } else {
      console.log(`Archivo .webm eliminado: ${webmFilePath}`);
    }
  });
}

function deleteMPDFile(streamId) {
  const mpdFilePath = `public/${streamId}.mpd`;
  fs.unlink(mpdFilePath, (err) => {
    if (err) {
      console.error(`Error al eliminar .mpd file: ${err}`);
    } else {
      console.log(`Archivo .mpd eliminado: ${mpdFilePath}`);
    }
  });
}

app.get('/live/:streamId', (req, res) => {
  const { streamId } = req.params;
  const mpdFilePath = path.join(__dirname, 'public', `${streamId}.mpd`);

  fs.access(mpdFilePath, fs.constants.F_OK, (error) => {
    if (error) {
      console.error(`Error al acceder al archivo .mpd: ${error}`);
      res.status(404).send('Not found');
    } else {
      res.sendFile(mpdFilePath);
    }
  });
});

const PORT = process.env.PORT || 3500;

httpServer.listen(PORT, () => {
  console.log(`Servidor de streaming DASH en vivo escuchando en el puerto ${PORT}`);
});
