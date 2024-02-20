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

  static async findById(post_id, userId) {
    try {
      const query = `
        SELECT posts.id, users.username, posts.room_name, posts.description, posts.stars, posts.lat, posts.lng, 
        CASE WHEN posts.user_id = $2 THEN true ELSE false END AS isUserPost
        FROM posts 
        INNER JOIN users ON posts.user_id = users.user_id
        WHERE posts.id = $1
      `;
      const parameters = [post_id, userId];
      const result = await PostDatabase.query(query, parameters);
      
      let post = result.length > 0 ? result[0] : null;
      
      return post;
    } catch (error) {
      throw new Error('An error occurred while executing the query');
    }
  }

  static async findByIdAndUpdate(id, data, options) {
    return await PostDatabase.updatePostById(id, data, options);
  }

  static async findByIdAndDelete(id) {
    return await PostDatabase.deletePostById(id);
  }

  static async updateStars(post_id, user_id) {
    let query = 'SELECT * FROM stars WHERE user_id = $1 AND post_id = $2';
    let parameters = [user_id, post_id];
    let result = await PostDatabase.query(query, parameters);
    
    console.log(`Result of check query: ${JSON.stringify(result)}`);
    
    if (result && result.length > 0) {
      throw new Error(`User ${user_id} has already starred post ${post_id}`);
    }
  
    query = 'INSERT INTO stars (user_id, post_id, time) VALUES ($1, $2, NOW())';
    parameters = [user_id, post_id];
    await PostDatabase.query(query, parameters);
  
    query = 'UPDATE posts SET stars = (SELECT COUNT(*) FROM stars WHERE post_id = $1) WHERE id = $1';
    parameters = [post_id];
    await PostDatabase.query(query, parameters);
  
    query = 'SELECT COUNT(*) AS total_stars FROM stars WHERE post_id = $1';
    parameters = [post_id];
    result = await PostDatabase.query(query, parameters);
    
    console.log(`Result of count query: ${JSON.stringify(result)}`);
    
    if (!result || result.length === 0) {
      return { totalStars: 0 }; 
    }
    
    const totalStars = result[0].total_stars;
  
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

  static async updateLikes(publication_id, user_id) {
    let query = 'SELECT * FROM likes WHERE user_id = $1 AND publication_id = $2';
    let parameters = [user_id, publication_id];
    let result = await PostDatabase.query(query, parameters);
    
    if (result && result.length > 0) {
      throw new Error(`User ${user_id} has already liked post ${publication_id}`);
    }
  
    query = 'INSERT INTO likes (user_id, publication_id, time) VALUES ($1, $2, NOW())';
    parameters = [user_id, publication_id];
    await PostDatabase.query(query, parameters);
  
    query = 'UPDATE publications SET likes = (SELECT COUNT(*) FROM likes WHERE publication_id = $1) WHERE id = $1';
    parameters = [publication_id];
    await PostDatabase.query(query, parameters);
  
    query = 'SELECT COUNT(*) AS total_likes FROM likes WHERE publication_id = $1';
    parameters = [publication_id];
    result = await PostDatabase.query(query, parameters);
    
    if (!result || result.length === 0) {
      return { totalLikes: 0 };
    }
    
    const totalLikes = result[0].total_likes;
  
    return { totalLikes };
  }

  static async addComment(data) {
    const { user_id, publication_id, text } = data;
    const time = new Date();
    const query = 'INSERT INTO comments (publication_id, user_id, text, time) VALUES ($1, $2, $3, $4) RETURNING *';
    const parameters = [publication_id, user_id, text, time];
    return await PostDatabase.query(query, parameters);
  }

  static async getComments() {
    const query = `
      SELECT comments.id, comments.publication_id, users.username, comments.text, comments.time 
      FROM comments 
      INNER JOIN users ON comments.user_id = users.user_id
    `;
    return await PostDatabase.query(query);
  }

  static async deleteComment(id) {
    const query = 'DELETE FROM comments WHERE id = $1';
    const parameters = [id];
    return await PostDatabase.query(query, parameters);
  }
  
}

export default PostModel;