import { AuthModel } from '../models/authModelsApp.js';
import { AuthDatabase } from '../databases/authDatabasesApp.js';
import { AuthController } from '../controllers/authControllersApp.js';


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
      };
    },
  },
};