import { z } from 'zod';
import PostModel from '../models/postModels.js';

// Define the post input schema
const postInputSchema = z.object({
  roomName: z.string(),
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
      console.log(`roomName: ${postInput.roomName}, lat: ${postInput.lat}, lng: ${postInput.lng}, userId: ${userId}`);
  
      // Include the user_id in the call to createPost
      const newPost = await PostModel.createPost(userId, postInput.roomName, postInput.lat, postInput.lng);
  
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

  getPost: async (req, res) => {
    const post = await PostModel.findById(req.params.id);
    res.status(200).send(post);
  },

  updatePost: async (req, res) => {
    const post = await PostModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).send(post);
  },

  deletePost: async (req, res) => {
    await PostModel.findByIdAndDelete(req.params.id);
    res.status(200).send({ message: 'Post deleted' });
  },

  addComment: async (req, res) => {
    const post = await PostModel.findById(req.params.id);
    post.comments.push(req.body);
    await post.save();
    res.status(200).send(post);
  },

  likePost: async (req, res) => {
    const post = await PostModel.findById(req.params.id);
    post.likes += 1;
    await post.save();
    res.status(200).send(post);
  }
};