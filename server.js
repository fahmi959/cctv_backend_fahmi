const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors'); // Wajib ditambah untuk API Frontend
const ytdl = require('@distube/ytdl-core'); // Library MP3

// Set port untuk aplikasi (Lokal)
const PORT = process.env.PORT || 3000;

// Izinkan CORS (SANGAT PENTING agar base44/React bisa akses)
app.use(cors());

// Menyajikan file statis (HTML dan lainnya)
app.use(express.static(path.join(__dirname, 'public')));

// ====================================================
// ENDPOINT 1: CCTV / RTMP STREAM
// ====================================================
app.post('/stream', (req, res) => {
    console.log("Stream received");
    res.status(200).send("Stream received");
});

// Endpoint untuk halaman index
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ====================================================
// ENDPOINT 2: FAHMI MP3 (Tampil di domain/api/lagu)
// ====================================================
app.get('/api/lagu', async (req, res) => {
    // 1. TANGKAP ID DARI URL (?id=...)
    const { id } = req.query;

    // Jika diakses polosan tanpa ID (Untuk nge-tes server online)
    if (!id) {
        return res.status(200).json({ 
            status: "Ready",
            message: "Server CCTV & MP3 Ready 🚀! Tambahkan parameter ?id=ID_YOUTUBE untuk download." 
        });
    }

    const url = `https://www.youtube.com/watch?v=${id}`;

    // Validasi URL/ID
    if (!ytdl.validateURL(url)) {
        return res.status(400).json({ error: 'ID YouTube tidak valid atau video tidak ditemukan.' });
    }

    try {
        // Ambil METADATA VIDEO (Untuk nama file)
        const info = await ytdl.getInfo(url);
        
        // Bersihkan judul
        let title = info.videoDetails.title.replace(/[^\w\s-]/gi, '').trim();
        if (!title) title = "Audio_Track";

        // SET HEADER UNTUK AUTO-DOWNLOAD BROWSER
        res.setHeader('Content-Disposition', `attachment; filename="FahmiMp3 - ${title}.mp3"`);
        res.setHeader('Content-Type', 'audio/mpeg');

        // PROSES STREAMING & DOWNLOAD
        const audioStream = ytdl(url, {
            filter: 'audioonly',
            quality: 'highestaudio'
        });

        audioStream.pipe(res);

        audioStream.on('error', (err) => {
            console.error('Streaming Error:', err);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Terjadi kesalahan saat memproses audio stream.' });
            } else {
                res.end();
            }
        });

    } catch (error) {
        console.error('Server Error:', error.message);
        return res.status(500).json({ 
            error: 'Gagal memproses video.', 
            details: error.message 
        });
    }
});

// ====================================================
// PENGATURAN SERVER LOKAL & VERCEL
// ====================================================

// Mencegah "Error 500: PORT Crash" di Vercel
// app.listen HANYA dijalankan jika kita running di komputer lokal, BUKAN di Vercel.
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Ekspor app Express ini (WAJIB UNTUK VERCEL)
module.exports = app;
