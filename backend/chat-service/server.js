import express from "express";
import { authRouter } from "./v1/routes/chatRoutes.js";
import { corsMiddleware } from "./middlewares/cors.js";
import middleware from "./middlewares/headers.js";

const app = express();
app.use(express.json());
app.use(corsMiddleware);
app.use(middleware.helmetMiddleware);
app.use(middleware.winstonMiddleware.bind(middleware));
app.use('/chat-service', authRouter);
app.use(middleware.winstonErrorMiddleware.bind(middleware));

const PORT = process.env.PORT ?? 3200;
app.listen(PORT, () => {
    console.log(`Listening on port http://localhost:${PORT}`);
});