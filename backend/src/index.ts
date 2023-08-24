import http from 'http';
import cors from 'cors'
import express from 'express';
import { WebSocket } from 'ws';
import * as util from 'util';



const app = express();
const PORT = 5000;
const server = http.createServer(app);
app.use(cors());

const io = require('socket.io')(server, {
  cors: {
      origin: "*",  // adjust this to tighten the CORS rules
      methods: ["GET", "POST"]
  }
});

let queue: any = [];
let roomCount = 0;

io.on('connection', (socket: any) => {

  socket.on('joinGame', (userId: string) => {
    console.log("User with ID:", userId, "wants to join a game!");

    // Attach the userId to the socket for future reference
    socket.userId = userId;

    // Notify the new user about all users that joined before
    const usersBefore = queue.map((player: any) => player.userId);

    // if theres any users already waiting, send them to new client
    if (usersBefore)
      socket.emit('previousUsers', usersBefore);

    // Broadcast the new user's ID to everyone already in the queue
    for (let player of queue) {
        player.emit('userJoined', userId);
    }

    queue.push(socket);

    // Check if the queue has enough players for a new room
    if(queue.length === 3) {
        roomCount++;
        const roomName = 'room-' + roomCount;

        // Assign each player in the queue to the room
        for(let player of queue) {
            player.join(roomName);
            // Let the client know which room they are in
            player.emit('assignedRoom', roomName);
        }

        // Reset the queue for next set of players
        queue = [];
    }
});

    socket.on('canvasData', (data: any) => {
        console.log('received canvas data', data)
        socket.to(data.roomName).emit('serverDraw', data);
    });
});

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}/`);
});