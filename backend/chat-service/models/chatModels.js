import chatdb from '../databases/chatDatabases.js'

export const createTables = async () => {
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

export const createChatRoom = async (roomName) => {
  const result = await db.query('INSERT INTO chat_rooms (name) VALUES ($1) RETURNING *', [roomName])
  return result.rows[0]
}

export const deleteChatRoom = async (roomId) => {
  const result = await db.query('DELETE FROM chat_rooms WHERE id = $1 RETURNING *', [roomId])
  return result.rows[0]
}

export const getMessages = async () => {
    const result = await chatdb.query(
        'SELECT * FROM messages ORDER BY id DESC LIMIT 100'
    )
    return result.rows.reverse()
}

export const insertMessage = async (msg, username) => {
    const result = await chatdb.query(
        'INSERT INTO messages (content, username) VALUES ($1, $2) RETURNING id',
        [msg, username]
    )
    return result.rows[0].id
}