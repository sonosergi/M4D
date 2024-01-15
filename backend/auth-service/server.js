import express from "express";
import { authRouter } from "./v1/routes/auth.js";
import { corsMiddleware } from "./middlewares/cors.js";
import middleware from "./middlewares/headers.js";

const app = express();
app.use(express.json());
app.use(corsMiddleware);
app.use(middleware.helmetMiddleware);
app.use(middleware.winstonMiddleware.bind(middleware));
app.use('/auth-service', authRouter);
app.use(middleware.winstonErrorMiddleware.bind(middleware));

const PORT = process.env.PORT ?? 3100;
app.listen(PORT, () => {
    console.log(`Listening on port http://localhost:${PORT}`);
});