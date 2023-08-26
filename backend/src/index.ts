import http from 'http';
import cors from 'cors'
import express from 'express';
import { WebSocket } from 'ws';
import * as util from 'util';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';



const app = express();
const PORT = 4000;
const server = http.createServer(app);
const imgNum = 1;
app.use(cors());

const io = require('socket.io')(server, {
  cors: {
      origin: "*",
      methods: ["GET", "POST"]
  }
});


let queue: any = [];
let roomCount = 0;

const topics = ['house', 'cat', 'fish', 'camera', 'teddy-bear', 'bicycle', 'sun', 'hat', 'tree', 'lion', 'telephone', 'hand', 'leaf', 'star', 'baseball', 'car', 'snowman', 'guitar', 'moustache']

io.on('connection', (socket: any) => {
//   console.log("Client connected");

  socket.on('joinGame', (userId: string) => {
    // console.log("User with ID:", userId, "wants to join a game!");

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

        // get a topic and give that topic to them to draw.
        let topic = topics[Math.floor(Math.random() * topics.length)]
        // Assign each player in the queue to the room
        // The delay is negligible so we dont need a start
        // count down. Once they get the assigned room, start
        // the game with their respective topic.
        for(let player of queue) {
            player.topic = topic;
            player.join(roomName);
            // Let the client know which room they are in
            player.emit('assignedRoom', {roomName, topic});
        }

        // Reset the queue for next set of players
        queue = [];
    }
});

    socket.on('canvasData', async (data: any) => {
        // const filePath = path.join(__dirname, `image${imgNum}.png`);  
        // console.log('filepath:', filePath)
        // fs.writeFile(filePath, data.blob, (err: any) => {
        //     if (err) throw err;
        //     console.log('The file has been saved!');
        // });

    //   console.log(data)
    //   console.log('server draw', data.roomName)
      socket.to(data.roomName).emit('serverDraw', data);

      // only look at it if the messages are greater than 5
      if (data.messageNum > 5) {
      try {
        // Now send the data to Flask in the background
        const base64data = data.blob.toString('base64');
        const response = await axios.post('http://flask_ml_server:5000/predict', {
            canvas_data: 'data:image/png;base64,' + base64data,
            user_id: data.userId,
            room_name: data.roomName
        });

        // console.log("Flask response:", response.data.message);

        // if the users guess was in the top 10 send that this player won.
        let guesses = response.data.message.guesses;
        if (guesses.includes(socket.topic)) {
        // console.log("GUESSES AND TOPIC", guesses, socket.topic)
        // use io to send instead of the actual socket that sent the first message so that
        // you can send to all. Don't exclude any of them.
        io.to(data.roomName).emit('winner', socket.userId);
        }
        // If you need to emit something back to the socket after the Flask response
        // socket.emit('someEvent', response.data);

    } catch (error) {
        console.error("Error calling the Flask API:");
    }
}
});

socket.on('disconnect', () => {
    // console.log("Client disconnected:", socket.userId);
    queue = queue.filter((player: any) => player.userId !== socket.userId);
  });


  
});

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running at http://localhost:${PORT}/`);
});