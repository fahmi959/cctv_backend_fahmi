const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');

const app = express();

// Mengizinkan frontend (Base44/React) mengakses backend ini
app.use(cors());

// INI KUNCINYA: Rute disesuaikan persis dengan panggilan dari Frontend
app.get('/api/lagu', async (req, res) => {
    
    // Menangkap ?id= dari URL
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'ID YouTube wajib disertakan' });
    }

    const url = `https://www.youtube.com/watch?v=${id}`;

    if (!ytdl.validateURL(url)) {
        return res.status(400).json({ error: 'ID YouTube tidak valid' });
    }

    try {
        // Ambil info untuk nama file
        const info = await ytdl.getInfo(url);
        let title = info.videoDetails.title.replace(/[^\w\s-]/gi, '').trim();
        if (!title) title = "Audio_Track";

        // Set header agar browser otomatis melakukan DOWNLOAD
        res.setHeader('Content-Disposition', `attachment; filename="FahmiMp3 - ${title}.mp3"`);
        res.setHeader('Content-Type', 'audio/mpeg');

        // Mulai streaming audio
        const audioStream = ytdl(url, {
            filter: 'audioonly',
            quality: 'highestaudio'
        });

        // Alirkan langsung ke browser (Frontend)
        audioStream.pipe(res);

        audioStream.on('error', (err) => {
            console.error('Error saat streaming:', err);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Terjadi kesalahan saat download.' });
            } else {
                res.end();
            }
        });

    } catch (error) {
        console.error('Server Error:', error.message);
        return res.status(500).json({ error: 'Gagal memproses video', details: error.message });
    }
});

// WAJIB ADA UNTUK VERCEL: Export app Express-nya
module.exports = app;
