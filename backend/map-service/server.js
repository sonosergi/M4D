import express from 'express';
import mapRouter from './v1/routes/mapRoutes.js';
import { validateUser } from './middlewares/validateUser.js';

const app = express();
const PORT = process.env.PORT || 5500;



import cors from 'cors';
app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST'],
  credentials: true 
}));
app.use(validateUser);
app.use(express.json());


app.use('/', mapRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});