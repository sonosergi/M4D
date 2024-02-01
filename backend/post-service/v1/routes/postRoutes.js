import { Router } from 'express';
import { PostController } from '../../controllers/postControllers.js';

const PostRouter = Router();

PostRouter.post('/post', (req, res) => PostController.createPost(req, res));
PostRouter.get('/posts', (req, res) => PostController.listPosts(req, res));
PostRouter.get('/post/:id', (req, res) => PostController.getPost(req, res));
PostRouter.put('/updateStars', (req, res) => PostController.updateStars(req, res));

PostRouter.get('/getUsernameById', (req, res) => PostController.getUsernameById(req, res));

PostRouter.put('/post/:id', (req, res) => PostController.updatePost(req, res));
PostRouter.delete('/post/:id', (req, res) => PostController.deletePost(req, res));

PostRouter.post('/publication', (req, res) => PostController.addPublication(req, res));
PostRouter.get('/publications', (req, res) => PostController.getPublications(req, res));
PostRouter.delete('/publication/:id', (req, res) => PostController.deletePublication(req, res));
PostRouter.put('/publication/:id/likes', (req, res) => PostController.updateLikes(req, res));

PostRouter.post('/comment', (req, res) => PostController.addComment(req, res));
PostRouter.get('/comments', (req, res) => PostController.getComments(req, res));
PostRouter.delete('/comment/:id', (req, res) => PostController.deleteComment(req, res));


export default PostRouter;