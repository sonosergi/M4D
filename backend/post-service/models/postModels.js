import { PostDatabase } from "../databases/postDatabases.js"; 
import { z } from 'zod';

const postInputSchema = z.object({
  user_id: z.string().uuid(),
  roomName: z.string().min(1),
  description: z.string(), 
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

  static async createPost(user_id, roomName, description, lat, lng) {
    const postInput = postInputSchema.parse({ user_id, roomName, description, lat, lng });
  
    const existingPost = await PostDatabase.query(
      'SELECT * FROM posts WHERE room_name = $1',
      [postInput.roomName]
    );
  
    if (existingPost.length > 0) {
      throw new Error('Post already exists');
    }
  
    const newPost = await PostDatabase.query(
      'INSERT INTO posts (user_id, room_name, description, lat, lng) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [postInput.user_id, postInput.roomName, postInput.description, postInput.lat, postInput.lng]
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

  static async updateStars(post_id, user_id) {
    // Comprueba si el usuario ya ha dado una estrella al post
    let query = 'SELECT * FROM stars WHERE user_id = $1 AND post_id = $2';
    let parameters = [user_id, post_id];
    let result = await PostDatabase.query(query, parameters);
    if (result.rows && result.rows.length > 0) {
      // Si el usuario ya ha dado una estrella al post, lanza un error
      throw new Error(`User ${user_id} has already starred post ${post_id}`);
    }
  
    // Si el usuario no ha dado una estrella al post, añade una entrada a la tabla stars
    query = 'INSERT INTO stars (user_id, post_id, time) VALUES ($1, $2, NOW())';
    parameters = [user_id, post_id];
    await PostDatabase.query(query, parameters);
  
    // Obtiene el número total de estrellas para el post
    query = 'SELECT COUNT(*) AS total_stars FROM stars WHERE post_id = $1';
    parameters = [post_id];
    result = await PostDatabase.query(query, parameters);
    
    // Verifica que result.rows no esté vacío
    if (!result.rows || result.rows.length === 0) {
      return { totalStars: 0 }; // Devuelve un objeto con totalStars: 0 si no se encuentran estrellas
    }
    
    const totalStars = result.rows[0].total_stars;
  
    // Actualiza el número de estrellas en la tabla posts
    query = 'UPDATE posts SET stars = $1 WHERE id = $2';
    parameters = [totalStars, post_id];
    await PostDatabase.query(query, parameters);
  
    // Devuelve el número total de estrellas
    return { totalStars };
  }

  static async getUsernameById(id) {
    const query = 'SELECT username FROM users WHERE id = $1';
    const parameters = [id];
    return await PostDatabase.query(query, parameters);
  }

  static async addPublication(req) {
    if (!req.user || !req.user.id) {
      throw new Error('User not authenticated');
    }
    
    const user_id = req.user.id;
    const data = req.body;
    const currentTime = new Date().toISOString(); // Get current timestamp
    const query = 'INSERT INTO publications (post_id, title, description, image_url, user_id, time, likes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *';
    const parameters = [data.post_id, data.title, data.description, data.image_url, user_id, currentTime, data.likes];
    return await PostDatabase.query(query, parameters);
  }

  static async getPublications(post_id) {
    const query = 'SELECT * FROM publications WHERE post_id = $1';
    return await PostDatabase.query(query, [post_id]);
  }

  static async deletePublication(id) {
    const query = 'DELETE FROM publications WHERE id = $1';
    const parameters = [id];
    return await PostDatabase.query(query, parameters);
  }

  static async updateLikes(id, likes) {
    const query = 'UPDATE publications SET likes = $1 WHERE id = $2 RETURNING *';
    const parameters = [likes, id];
    return await PostDatabase.query(query, parameters);
  }

  static async addComment(data) {
    const query = 'INSERT INTO comments (publication_id, user_id, text, time) VALUES ($1, $2, $3, $4) RETURNING *';
    const parameters = [data.publication_id, data.user_id, data.text, data.time];
    return await PostDatabase.query(query, parameters);
  }

  static async getComments() {
    const query = 'SELECT * FROM comments';
    return await PostDatabase.query(query);
  }

  static async deleteComment(id) {
    const query = 'DELETE FROM comments WHERE id = $1';
    const parameters = [id];
    return await PostDatabase.query(query, parameters);
  }
  
}

export default PostModel;