import express from 'express';
import fileUpload from 'express-fileupload';
import PostRouter from './v1/routes/postRoutes.js';
import { validateUser } from './middleware/validateUser.js';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;
const allowedOrigins = ['http://localhost:5173'];

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
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
app.use('/', PostRouter);

// Habilita la carga de archivos
app.use(fileUpload());

// Ruta para servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/uploads', (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  // El nombre del campo de entrada (es decir, "image") se utiliza para recuperar el archivo cargado
  let image = req.files.image;

  // Usa la fecha actual para obtener un nombre de archivo único
  let filename = Date.now() + path.extname(image.name);

  // Usa el método mv() para colocar el archivo en la carpeta de uploads
  image.mv(path.join(__dirname, 'uploads', filename), function(err) {
    if (err)
      return res.status(500).send(err);

    res.send({filename: filename});
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});