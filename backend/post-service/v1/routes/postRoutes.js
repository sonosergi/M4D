import { Router } from 'express';
import { PostController } from '../../controllers/postControllers.js';

const PostRouter = Router();

PostRouter.post('/post', PostController.createPost);

PostRouter.get('/posts', PostController.listPosts);

PostRouter.get('/post/:id', PostController.getPost);

PostRouter.put('/post/:id', PostController.updatePost);

PostRouter.delete('/post/:id', PostController.deletePost);

PostRouter.post('/post/:id/comment', PostController.addComment);

PostRouter.post('/post/:id/like', PostController.likePost);

export default PostRouter;