import express from 'express';
import mapRouter from './v1/routes/mapRoutes.js';
//import { validateUser } from './middleware/validateUser.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/', mapRouter);
//app.use(validateUser);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});