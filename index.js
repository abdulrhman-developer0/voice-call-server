import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';

dotenv.config();

const port = process.env.APP_PORT ?? 3000;

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const clients = {};

app.use(express.static(path.join(process.cwd(), 'public')));

io.on('connection', (socket) => {
    const apiKey = socket.handshake.query.apiKey;
    const appAuthKey = process.env.APP_AUTH_KEY;
    console.log(apiKey, appAuthKey)

    if (appAuthKey && appAuthKey !== apiKey) {
        socket.emit('error', "Invalid API Key");
        return;
    }

    const clientId = socket.handshake.query.id;

    if (!clientId) {
        socket.emit('error', "Reqired unique id to identify clent");
        return;
    }

    clients[clientId] = { id: clientId, socket, inCall: false };
    console.log(`Client connected with id ${clientId}`);

    socket.on('offer', (data) => {
        const targetClient = clients[data.to];

        if (!targetClient) {
            socket.emit('error', `Client with id ${data.to} is not connected.`);
            return
        }

        targetClient.emit('offer', {
            from: clientId,
            offer: data.offer
        });
    });

    socket.on('answer', (data) => {
        const targetClient = clients[data.to];

        if (!targetClient) {
            socket.emit('error', `Client with id ${data.to} is not connected.`);
            return
        }

        targetClient.emit('answer', {
            from: clientId,
            answer: data.answer
        });
    });

    socket.on('candidate', (data) => {
        const targetClient = clients[data.to];

        if (! targetClient ) {
            socket.emit('error', `Client with id ${data.to} is not connected.`);
            return
        }

        targetClient.emit('candidate', {
                from: clientId,
                candidate: data.candidate
            });
    });

    socket.on('disconnect', () => {
        delete clients[clientId];
        console.log(`Client disconnected: ${clientId}`);
    });
});


server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
