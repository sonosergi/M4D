import { z } from 'zod';
import PostModel from '../models/postModels.js';

// Define the post input schema
const postInputSchema = z.object({
  roomName: z.string(),
  description: z.string(), 
  lat: z.number(),
  lng: z.number(),
  user_id: z.string()
});

export const PostController = {
  createPost: async (req, res, next) => {
    try {
      console.log(req.body); // Add this line to log the request body
  
      // Check if the user is authenticated
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
  
      // Extract the user_id from req.user
      const userId = req.user.id;
  
      // Parse the request body
      const postInput = postInputSchema.parse({ user_id: userId, ...req.body });
  
      // Log the values that will be passed to createPost
      console.log(`roomName: ${postInput.roomName}, ${postInput.description}, lat: ${postInput.lat}, lng: ${postInput.lng}, userId: ${userId}`);
  
      // Include the user_id in the call to createPost
      const newPost = await PostModel.createPost(userId, postInput.roomName, postInput.description, postInput.lat, postInput.lng);
  
      res.status(201).json({ message: 'Post created', newPost });
    } catch (error) {
      console.error(error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.message });
      } else if (error.message === 'Post already exists') {
        res.status(400).json({ message: 'Post already exists' });
      } else {
        next(new Error('An error occurred while creating the post'));
      }
    }
  },

  listPosts: async (req, res) => {
    const posts = await PostModel.find();
    res.status(200).send(posts);
  },

  getPost: async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
  
      const userId = req.user.id;
      const {post_id} = req.query;
      console.log(`post_id: ${post_id}, userId: ${userId}`);
  
      const post = await PostModel.findById(post_id, userId);
  
      res.status(200).send(post);
    } catch (error) {
      console.error(error);
      next(new Error('An error occurred while getting the post'));
    }
  },

  updatePost: async (req, res) => {
    const post = await PostModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).send(post);
  },

  deletePost: async (req, res) => {
    await PostModel.findByIdAndDelete(req.params.id);
    res.status(200).send({ message: 'Post deleted' });
  },

  updateStars: async (req, res) => {
    const { post_id } = req.body; 
  
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
  
    const user_id = req.user.id;
  
    console.log(`post_id: ${post_id}, user_id: ${user_id}`);
    if (!post_id || !user_id) {
      return res.status(400).send({ error: 'post_id and user_id are required' });
    }
  
    try {
      const result = await PostModel.updateStars(post_id, user_id);
      res.status(200).send(result); 
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'An error occurred while updating stars' });
    }
  },

  getUsernameById: async (req, res) => {
    const username = await PostModel.getUsernameById(req.params.id);
    res.status(200).send(username);
  },

  addPublication: async (req, res, next) => {
    try {
      const newPublication = await PostModel.addPublication(req);
      res.status(201).json({ message: 'Publication created', newPublication });
    } catch (error) {
      console.error(error);
      next(new Error('An error occurred while creating the publication'));
    }
  },

  getPublications: async (req, res) => {
    const { post_id } = req.query;
    const publications = await PostModel.getPublications(post_id);
    res.status(200).send(publications);
  },

  deletePublication: async (req, res) => {
    await PostModel.deletePublication(req.params.id);
    res.status(200).send({ message: 'Publication deleted' });
  },

  updateLikes: async (req, res) => {
    const { publication_id } = req.body;
  
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
  
    const user_id = req.user.id;
  
    console.log(`publication_id: ${publication_id}, user_id: ${user_id}`);
    if (!publication_id || !user_id) {
      return res.status(400).send({ error: 'publication_id and user_id are required' });
    }
  
    try {
      const result = await PostModel.updateLikes(publication_id, user_id);
      res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'An error occurred while updating likes' });
    }
  },

  addComment: async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
  
    const user_id = req.user.id;
  
    try {
      const { publication_id, text } = req.body;
      const newComment = await PostModel.addComment({ user_id, publication_id, text });
      res.status(201).json({ message: 'Comment created', newComment });
    } catch (error) {
      console.error(error);
      next(new Error('An error occurred while creating the comment'));
    }
  },

  getComments: async (req, res) => {
    try {
      const comments = await PostModel.getComments();
      const commentsWithUsername = comments.map(comment => {
        return {
          id: comment.id,
          publication_id: comment.publication_id,
          username: comment.username,
          text: comment.text,
          time: comment.time
        }
      });
      res.status(200).send(commentsWithUsername);
      console.log(commentsWithUsername);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Error retrieving comments' });
    }
  },

  deleteComment: async (req, res) => {
    await PostModel.deleteComment(req.params.id);
    res.status(200).send({ message: 'Comment deleted' });
  },

};