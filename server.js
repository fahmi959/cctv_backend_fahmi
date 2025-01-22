const NodeMediaServer = require('node-media-server');

// Konfigurasi server Node.js untuk RTMP
const config = {
  logType: 3, // log level: 3 is for error logging
  rtmp: {
    port: 1935, // Port untuk RTMP (default 1935)
    chunk_size: 4096,
    gop_cache: true,
    ping: 60,
    ping_timeout: 30
  },
  http: {
    port: 8000, // Port untuk HTTP (misalnya streaming di browser)
    allow_origin: '*'
  }
};

const nms = new NodeMediaServer(config);

nms.run(); // Menjalankan server RTMP

console.log('NodeMediaServer started...');
