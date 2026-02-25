const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors'); // Wajib untuk frontend
const ytdl = require('@distube/ytdl-core'); // Library MP3

// Set port
const PORT = process.env.PORT || 3000;

// Izinkan CORS agar frontend (React/Base44) bisa akses tanpa diblokir
app.use(cors());

// Menyajikan file statis (HTML dan lainnya)
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// 1. ENDPOINT CCTV
// ==========================================
app.post('/stream', (req, res) => {
    console.log("Stream received");
    res.status(200).send("Stream received");
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==========================================
// 2. ENDPOINT FAHMI MP3 (/api/lagu)
// ==========================================
app.get('/api/lagu', async (req, res) => {
    const id = req.query.id;

    // Jika diakses polosan
    if (!id) {
        return res.status(200).json({ 
            status: "Ready", 
            message: "Server CCTV & MP3 Ready 🚀! Tambahkan parameter ?id=ID_YOUTUBE" 
        });
    }

    const url = `https://www.youtube.com/watch?v=${id}`;

    if (!ytdl.validateURL(url)) {
        return res.status(400).json({ error: 'ID YouTube tidak valid' });
    }

    try {
        const info = await ytdl.getInfo(url);
        let title = info.videoDetails.title.replace(/[^\w\s-]/gi, '').trim();
        if (!title) title = "Lagu_FahmiMp3";

        // Paksa browser download
        res.setHeader('Content-Disposition', `attachment; filename="FahmiMp3 - ${title}.mp3"`);
        res.setHeader('Content-Type', 'audio/mpeg');

        // Proses Streaming
        const audioStream = ytdl(url, {
            filter: 'audioonly',
            quality: 'highestaudio'
        });

        audioStream.pipe(res);

        audioStream.on('error', (err) => {
            console.error('Error Streaming:', err);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Gagal mengunduh audio' });
            } else {
                res.end();
            }
        });

    } catch (error) {
        console.error('Server Error:', error.message);
        res.status(500).json({ error: 'Gagal memproses video', details: error.message });
    }
});

// Menjalankan server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// WAJIB UNTUK VERCEL
module.exports = app;
