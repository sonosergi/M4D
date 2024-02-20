import express from "express";
import { authRouter } from "./v1/routes/authRoutesApp.js";
import Middleware from "./middlewares/headers.js";
import RateLimiters from './middlewares/rateLimiters.js';
import cors from 'cors';

const { helmetMiddleware, winstonMiddleware, winstonErrorMiddleware } = Middleware;
const app = express();
app.use(express.json());

// app.use(RateLimiters.limiter);
// app.use(RateLimiters.speedLimiter);
// app.use(helmetMiddleware);
// app.use(winstonMiddleware.bind(Middleware));
// app.use(winstonErrorMiddleware.bind(Middleware));

// const allowedOrigins = ['http://192.168.1.49:7575', 'http://localhost:7575'];

// app.use(cors({
//   origin: function(origin, callback){
//     if(!origin) return callback(null, true);
//     if(allowedOrigins.indexOf(origin) === -1){
//       var msg = 'The CORS policy for this site does not ' +
//                 'allow access from the specified Origin.';
//       return callback(new Error(msg), false);
//     }
//     return callback(null, true);
//   },
//   methods: ['GET', 'POST'],
//   //credentials: true 
// }));


app.use('/', authRouter);


app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT ?? 2000;
app.listen(PORT, () => {
    console.log(`Listening on port http://localhost:${PORT}`);
});