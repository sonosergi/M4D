import { getMessages, insertMessage } from '../models/chatModels.js'
import WebSocket from 'ws';

export const handleConnection = async (wss, connectedUsers, messages) => {
    wss.on('connection', async (ws) => {
        console.log('a user connected')

        ws.on('message', async (message) => {
            const data = JSON.parse(message);

            if (data.type === 'usernameSet') {
                ws.username = data.username;
                connectedUsers[ws._ultron.id] = data.username;
                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: 'users', users: Object.values(connectedUsers) }));
                    }
                });
            }

            if (data.type === 'chat message') {
                const username = ws.username ?? 'anonymous'
                console.log({ username })

                try {
                    const id = await insertMessage(data.msg, username)
                    const message = { msg: data.msg, id: id.toString(), username }

                    messages.push(message)
                    if (messages.length > 100) {
                        messages = messages.slice(-100)
                    }

                    wss.clients.forEach(client => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({ type: 'chat message', message }));
                        }
                    });
                } catch (e) {
                    console.error(e)
                    ws.send(JSON.stringify({ type: 'error', message: 'Error al enviar el mensaje.' }));
                }
            }
        });

        ws.on('close', () => {
            console.log('user disconnected')
            delete connectedUsers[ws._ultron.id]
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'users', users: Object.values(connectedUsers) }));
                }
            });
        });

        try {
            const previousMessages = await getMessages()
            messages = previousMessages
            ws.send(JSON.stringify({ type: 'previousMessages', messages }));
        } catch (e) {
            console.error(e)
            ws.send(JSON.stringify({ type: 'error', message: 'Error al recuperar los mensajes anteriores.' }));
        }
    });
}