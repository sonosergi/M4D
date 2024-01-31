import express from 'express';
import mapRouter from './v1/routes/mapRoutes.js';
import { validateUser } from './middlewares/validateUser.js';
import cors from 'cors';


const app = express();
const PORT = process.env.PORT || 5500;
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
  methods: ['GET', 'POST'],
  credentials: true 
}));

app.use(validateUser);
app.use(express.json());
app.use('/', mapRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});