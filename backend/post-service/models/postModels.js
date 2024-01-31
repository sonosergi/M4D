import { PostDatabase } from "../databases/postDatabases.js"; 
import { z } from 'zod';

const postInputSchema = z.object({
  user_id: z.string().uuid(),
  roomName: z.string().min(1),
  lat: z.number(), 
  lng: z.number(), 
});

class PostModel {
  constructor(postData) {
    this.data = postData;
  }

  async save() {
    return await PostDatabase.createPost(this.data);
  }

  static async createPost(user_id, roomName, lat, lng) {
    const postInput = postInputSchema.parse({ user_id, roomName, lat, lng });
  
    const existingPost = await PostDatabase.query(
      'SELECT * FROM posts WHERE room_name = $1',
      [postInput.roomName]
    );
  
    if (existingPost.length > 0) {
      throw new Error('Post already exists');
    }
  
    const newPost = await PostDatabase.query(
      'INSERT INTO posts (user_id, room_name, lat, lng) VALUES ($1, $2, $3, $4) RETURNING *',
      [postInput.user_id, postInput.roomName, postInput.lat, postInput.lng]
    );
  
    return newPost[0];
  }

  static async find() {
    return await PostDatabase.getAllPosts();
  }

  static async findById(id) {
    return await PostDatabase.getPostById(id);
  }

  static async findByIdAndUpdate(id, data, options) {
    return await PostDatabase.updatePostById(id, data, options);
  }

  static async findByIdAndDelete(id) {
    return await PostDatabase.deletePostById(id);
  }

  async addComment(comment) {
    this.data.comments.push(comment);
    return await PostDatabase.updatePostById(this.data.id, this.data);
  }

  async likePost() {
    this.data.likes += 1;
    return await PostDatabase.updatePostById(this.data.id, this.data);
  }
}

export default PostModel;