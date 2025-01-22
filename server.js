const express = require('express');
const WebSocket = require('ws');
const app = express();
const http = require('http');
const server = http.createServer(app);

// WebSocket server untuk menerima stream video
const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
    console.log('Client connected');

    // Menangani pesan yang diterima dari client (Aplikasi Android)
    ws.on('message', message => {
        console.log('Received message:', message);
        // Kirimkan data yang diterima ke semua client yang terhubung
        wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });

    ws.on('error', (err) => {
        console.error('WebSocket error:', err);
    });
});

// Menggunakan express untuk melayani file statis
app.use(express.static('public'));

// Menjalankan server pada port 3000
server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
