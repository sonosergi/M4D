import pgp from 'pg-promise';
import dotenv from 'dotenv';

dotenv.config();

const db = pgp()(process.env.DATABASE_URL);

class UserModel {
  static async getUser(id) {
    return db.one('SELECT * FROM users WHERE id = $1', [id]);
  }

  static async updateUser(id, name, email) {
    return db.one('UPDATE auth SET name = $1, email = $2 WHERE id = $3 RETURNING *', [name, email, id]);
  }

  static async deleteUser(id) {
    return db.none('DELETE FROM auth & user WHERE id = $1', [id]);
  }

  static async changePassword(id, newPassword) {
    return db.none('UPDATE auth SET password = $1 WHERE id = $2', [newPassword, id]);
  }
}

module.exports = UserModel;