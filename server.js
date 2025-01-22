const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public")); // Folder untuk file HTML

// Ketika ada client yang terhubung
io.on("connection", (socket) => {
  console.log(User connected: ${socket.id});

  // Terima video stream dari Android client
  socket.on("videoStream", (data) => {
    // Kirim stream ke semua client yang terhubung (browser)
     socket.broadcast.emit("receiveStream", { id: socket.id, data });
  });

  socket.on("disconnect", () => {
    console.log(User disconnected: ${socket.id});
  });
});

// Jalankan server di port 3000
server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
