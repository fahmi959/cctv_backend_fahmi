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


socket.on("receiveStream", ({ id, data }) => {
  console.log("Received stream data:", data); // Log data to ensure it's valid
  
  let videoElement = document.getElementById(id);
  if (!videoElement) {
    videoElement = document.createElement("video");
    videoElement.id = id;
    videoElement.autoplay = true;
    videoElement.controls = false;
    document.getElementById("videoContainer").appendChild(videoElement);
  }

  // Check if the base64 string is valid and log the Blob creation
  try {
    const byteCharacters = atob(data);  // Decoding Base64 to raw binary
    const byteArray = new Uint8Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteArray[i] = byteCharacters.charCodeAt(i);
    }

    const blob = new Blob([byteArray], { type: 'video/mp4' });  // Adjust MIME type if necessary
    const objectURL = URL.createObjectURL(blob);  // Create URL from Blob

    videoElement.src = objectURL;
  } catch (error) {
    console.error("Error decoding or creating Blob", error);
  }
});

