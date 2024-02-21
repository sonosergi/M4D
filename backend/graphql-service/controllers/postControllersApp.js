import { z } from 'zod';
import PostModel from '../models/postModelsApp.js';

const postInputSchema = z.object({
  roomName: z.string(),
  description: z.string(), 
  lat: z.number(),
  lng: z.number(),
  user_id: z.string(),
  category: z.string(),
  type_post: z.string(),
  duration: z.number()
});

const placeInputSchema = z.object({
  roomName: z.string(),
  description: z.string(), 
  lat: z.number(),
  lng: z.number(),
  user_id: z.string(),
  category: z.string(),
  type_post: z.string(),
});

export const PostController = {
  createEvent: async (eventData) => {
    try {
      const postInput = postInputSchema.parse(eventData);

      console.log(`roomName: ${postInput.roomName}, description: ${postInput.description}, lat: ${postInput.lat}, lng: ${postInput.lng}, userId: ${postInput.user_id}, category: ${postInput.category}, type_post: ${postInput.type_post}, duration: ${postInput.duration}`);

      const newPost = await PostModel.createEvent(postInput.user_id, postInput.roomName, postInput.description, postInput.lat, postInput.lng, postInput.category, postInput.type_post, postInput.duration);
      return newPost;
    } catch (error) {
      console.error(error);
      if (error instanceof z.ZodError) {
        throw new Error(error.message);
      } else if (error.message === 'Post already exists') {
        throw new Error('Post already exists');
      } else {
        throw new Error('An error occurred while creating the post');
      }
    }
  },

  createPlace: async (eventData) => {
    try {
      const placeInput = placeInputSchema.parse(eventData);

      console.log(`roomName: ${placeInput.roomName}, description: ${placeInput.description}, lat: ${placeInput.lat}, lng: ${placeInput.lng}, userId: ${placeInput.user_id}, category: ${placeInput.category}, type_post: ${placeInput.type_post}`);

      const newPost = await PostModel.createPlace(placeInput.user_id, placeInput.roomName, placeInput.description, placeInput.lat, placeInput.lng, placeInput.category, placeInput.type_post);
      return newPost;
    } catch (error) {
      console.error(error);
      if (error instanceof z.ZodError) {
        throw new Error(error.message);
      } else if (error.message === 'Post already exists') {
        throw new Error('Post already exists');
      } else {
        throw new Error('An error occurred while creating the post');
      }
    }
  },

  listPosts: async (req, res) => {
    const posts = await PostModel.find();
    res.status(200).send(posts);
    console.log(posts);
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
  
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      res.status(200).send(post);
      console.log(post);
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