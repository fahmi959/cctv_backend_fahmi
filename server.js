const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Listen for incoming connections
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });

    // Listen for video stream from Android
    socket.on('video', (data) => {
        // Broadcast the video data to all connected clients
        socket.broadcast.emit('video', data);
    });
});

// Start server on port 3000
server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
