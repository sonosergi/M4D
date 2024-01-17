import pgp from 'pg-promise';
import dotenv from 'dotenv';

dotenv.config();

const chatdb = pgp()(process.env.DATABASE_URL);

export class ChatDatabase {
  
}