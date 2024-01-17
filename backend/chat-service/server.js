import express from "express";
import { chatRoutes } from "./v1/routes/chatRoutes.js";
import { validateUser } from './middlewares/validateUser.js';



const app = express();
app.use(validateUser);
app.use(express.json());
//app.use(corsMiddleware);
app.use('/chat-service', chatRoutes);

const PORT = process.env.PORT ?? 3200;
app.listen(PORT, () => {
    console.log(`Listening on port http://localhost:${PORT}`);
});