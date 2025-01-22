const express = require('express');
const WebSocket = require('ws');
const app = express();
const http = require('http');
const server = http.createServer(app);

// Membuat server WebSocket
const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
    console.log('Client connected');
    
    // Mengirimkan pesan ke client
    ws.on('message', message => {
        console.log(`Received: ${message}`);
    });

    // Contoh mengirimkan data ke client
    ws.send('Hello from server!');
});

app.use(express.static('public')); // Menggunakan folder public untuk file statis

// Menjalankan server pada port tertentu
server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
