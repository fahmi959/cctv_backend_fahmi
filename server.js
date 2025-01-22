const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files (you can place your HTML file here)
app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("videoStream", (data) => {
    console.log("Received video stream data from client:", data);

    // Broadcast the binary stream data to all connected clients
    socket.broadcast.emit("receiveStream", { id: socket.id, data: data });
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
