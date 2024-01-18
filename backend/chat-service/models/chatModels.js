import { ChatDatabase as chatdb } from '../databases/chatDatabases.js'


export class ChatModel {
    static async createTables() {
        await chatdb.query(
            `CREATE TABLE IF NOT EXISTS chat (
                id SERIAL PRIMARY KEY,
                username VARCHAR(100) NOT NULL,
                password VARCHAR(100) NOT NULL
            )`
        )

        await chatdb.query(
            `CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                content TEXT NOT NULL,
                username VARCHAR(100) NOT NULL
            )`
        )
    }

    static async createChatRoom(roomName) {
        const result = await chatdb.query('INSERT INTO chat_rooms (name) VALUES ($1) RETURNING *', [roomName])
        return result.rows[0]
    }

    static async deleteChatRoom(roomId) {
        const result = await chatdb.query('DELETE FROM chat_rooms WHERE id = $1 RETURNING *', [roomId])
        return result.rows[0]
    }

    static async getMessages() {
        const result = await chatdb.query(
            'SELECT * FROM messages ORDER BY id DESC LIMIT 100'
        )
        return result.rows.reverse()
    }

    static async insertMessage(msg, username) {
        const result = await chatdb.query(
            'INSERT INTO messages (content, username) VALUES ($1, $2) RETURNING id',
            [msg, username]
        )
        return result.rows[0].id
    }
}