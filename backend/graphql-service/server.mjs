import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import express from 'express';
import { expressMiddleware } from '@apollo/server/express4';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import { typeDefs } from './graphql/typeDefs.mjs';
import { resolvers } from './graphql/resolvers.mjs';
import validateUserApp from './middlewares/validateUser.mjs';
import { AuthController } from './controllers/authControllersApp.js';
import validateSessionToken from './middlewares/validateSessionToken.mjs';

const app = express();
app.post('/requestNoAuth', AuthController.requestNoAuth);

const httpServer = http.createServer(app);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

app.use(
  cors(),
  bodyParser.json(),
);

// Ruta para operaciones que no necesitan user_id
app.use('/graphql/noAuth', validateUserApp, expressMiddleware(server));

// Ruta para operaciones que necesitan user_id
app.use('/graphql/withAuth', validateSessionToken, expressMiddleware(server));

const PORT = process.env.PORT || 7575;
await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
console.log(`🚀 Server ready at http://localhost:${PORT}`);