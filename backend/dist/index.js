"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const app = (0, express_1.default)();
const PORT = 5000;
const server = http_1.default.createServer(app);
const imgNum = 1;
app.use((0, cors_1.default)());
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
let queue = [];
let roomCount = 0;
io.on('connection', (socket) => {
    socket.on('joinGame', (userId) => {
        console.log("User with ID:", userId, "wants to join a game!");
        // Attach the userId to the socket for future reference
        socket.userId = userId;
        // Notify the new user about all users that joined before
        const usersBefore = queue.map((player) => player.userId);
        // if theres any users already waiting, send them to new client
        if (usersBefore)
            socket.emit('previousUsers', usersBefore);
        // Broadcast the new user's ID to everyone already in the queue
        for (let player of queue) {
            player.emit('userJoined', userId);
        }
        queue.push(socket);
        // Check if the queue has enough players for a new room
        if (queue.length === 3) {
            roomCount++;
            const roomName = 'room-' + roomCount;
            // Assign each player in the queue to the room
            for (let player of queue) {
                player.join(roomName);
                // Let the client know which room they are in
                player.emit('assignedRoom', roomName);
            }
            // Reset the queue for next set of players
            queue = [];
        }
    });
    socket.on('canvasData', (data) => {
        console.log('received canvas data', data);
        const filePath = path.join(__dirname, `image${imgNum}.png`);
        console.log('filepath:', filePath);
        fs.writeFile(filePath, data.blob, (err) => {
            if (err)
                throw err;
            console.log('The file has been saved!');
        });
        socket.to(data.roomName).emit('serverDraw', data);
    });
});
app.get('/', (req, res) => {
    res.send('Hello, World!');
});
server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}/`);
});
