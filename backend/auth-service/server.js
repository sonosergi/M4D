import express from "express";
import { authRouter } from "./v1/routes/authRoutes.js";
//import { corsMiddleware } from "./middlewares/cors.js";
import Middleware from "./middlewares/headers.js";
import RateLimiters from './middlewares/rateLimiters.js';



const { helmetMiddleware, winstonMiddleware, winstonErrorMiddleware } = Middleware;
const app = express();
app.use(express.json());

import cors from 'cors';
app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST'],
  credentials: "true" ,
}));

//app.use(corsMiddleware);
app.use(RateLimiters.limiter);
app.use(RateLimiters.speedLimiter);
app.use(helmetMiddleware);
app.use(winstonMiddleware.bind(Middleware));
app.use(winstonErrorMiddleware.bind(Middleware));

app.use('/', authRouter);

app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT ?? 4000;
app.listen(PORT, () => {
    console.log(`Listening on port http://localhost:${PORT}`);
});