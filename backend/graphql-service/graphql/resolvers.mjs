import { AuthModel } from '../models/authModelsApp.js';
import { AuthDatabase } from '../databases/authDatabasesApp.js';
import { AuthController } from '../controllers/authControllersApp.js';
import { PostController } from '../controllers/postControllersApp.js';

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const resolvers = {
  Mutation: {
    register: async (_, { username, password, phoneNumber, type }) => {
      
      // Check if user already exists
      const userExists = await AuthDatabase.userExists(username, phoneNumber);
      if (userExists) {
        throw new Error('User already exists');
      }

      await AuthModel.createUser(type, phoneNumber, username, password);
      const user = await AuthModel.getUser({ username });
      return user;
    },

    login: async (_, { username, password } ) => {

      // Check if user exists
      const user = await AuthModel.getUser({ username });
      if (!user) {
        throw new Error('User does not exist');
      }
    
      // Check if password is correct
      const isPasswordCorrect = await AuthModel.comparePassword(password, user.password);
      if (!isPasswordCorrect) {
        throw new Error('Invalid password');
      }
    
      // Check if user is defined before generating token
      let tokens;
      if (user) {
        tokens = await AuthController.requestCookieSession(user);
      } else {
        throw new Error('User is undefined');
      }
    
      // Return tokens
      return {
        sessionToken: tokens.sessionToken,
        userTypeToken: tokens.userTypeToken,
        userIdToken: tokens.userIdToken,
      };
    },

    createEvent: async (_, { name, description, lat, lng, category, duration }, context) => {
      const userIdToken  = context.user_id;
      console.log('userIdToken: ', context.user_id);
      try {
        const decodedToken = jwt.verify(userIdToken, process.env.SECRET_KEY);
        const userId = decodedToken;
        console.log('userId: ', userId);
        if (!category) {
          throw new Error('Category is required');
        }
        const eventData = { roomName: name, description, lat, lng, category, user_id: userId.user_id, type_post: 'event', duration };
        context.newPost = await PostController.createEvent(eventData);
        return { message: 'Event created', newPost: context.newPost };
      } catch (error) {
        console.error(error);
        throw new Error('An error occurred while creating the post');
      }
    },
    
    createPlace: async (_, { name, description, lat, lng, category }, context) => {
      const userIdToken  = context.user_id;
      console.log('userIdToken: ', context.user_id);
      try {
        const decodedToken = jwt.verify(userIdToken, process.env.SECRET_KEY);
        const userId = decodedToken;
        console.log('userId: ', userId);
        if (!category) {
          throw new Error('Category is required');
        }
        const eventData = { roomName: name, description, lat, lng, category, user_id: userId.user_id, type_post: 'place' };
        context.newPlace = await PostController.createPlace(eventData);
        return { message: 'Place created', newPost: context.newPost };
      } catch (error) {
        console.error(error);
        throw new Error('An error occurred while creating the post');
      }
    },

  },
};