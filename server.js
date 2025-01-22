// server.js (Backend: WebSocket signaling)

const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 3000 });

wss.on('connection', function connection(ws) {
    console.log("Client connected");

    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        // Broadcast message to all connected clients (signaling data)
        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        console.log("Client disconnected");
    });
});
