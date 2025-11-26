const express = require('express');
const app = express();
const path = require('path');

// Set port untuk aplikasi
const PORT = process.env.PORT || 3000;

// Menyajikan file statis (HTML dan lainnya)
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint untuk menerima data stream dari aplikasi Android (RTMP streaming)
// Anda bisa menggunakan library seperti fluent-ffmpeg untuk memproses stream di backend, namun untuk saat ini
// kita hanya menyediakan API dasar untuk menerima stream dari frontend
app.post('/stream', (req, res) => {
    console.log("Stream received");
    res.status(200).send("Stream received");
});

// Endpoint untuk halaman index
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint untuk halaman kunci
app.get('/kunci', (req, res) => { 
    res.sendFile(path.join(__dirname, 'public', 'kunci.html')); 
});


// Menjalankan server pada PORT yang ditentukan
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
