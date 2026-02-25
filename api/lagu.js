const ytdl = require('@distube/ytdl-core');

module.exports = async (req, res) => {
    // 1. SETUP CORS AGAR FRONTEND BISA AKSES
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Handle Preflight Request Browser
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Hanya izinkan metode GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Gunakan metode GET' });
    }

    // 2. TANGKAP PARAMETER ID (?id=...)
    const id = req.query.id;

    // === MODIFIKASI: JIKA DIAKSES POLOSAN (TANPA ID) ===
    if (!id) {
        return res.status(200).json({ 
            status: "Ready", 
            message: "Server Lagu Ready 🚀! Tambahkan parameter ?id=ID_YOUTUBE untuk mendownload lagu." 
        });
    }

    const url = `https://www.youtube.com/watch?v=${id}`;

    // Validasi apakah ID YouTube benar
    if (!ytdl.validateURL(url)) {
        return res.status(400).json({ error: 'ID YouTube tidak valid' });
    }

    try {
        // 3. AMBIL INFO VIDEO & BERSIHKAN NAMA FILE
        const info = await ytdl.getInfo(url);
        let title = info.videoDetails.title.replace(/[^\w\s-]/gi, '').trim();
        if (!title) title = "Lagu_FahmiMp3";

        // 4. PAKSA BROWSER UNTUK DOWNLOAD (BUKAN PLAY DI BROWSER)
        res.setHeader('Content-Disposition', `attachment; filename="FahmiMp3 - ${title}.mp3"`);
        res.setHeader('Content-Type', 'audio/mpeg');

        // 5. STREAMING AUDIO
        const audioStream = ytdl(url, {
            filter: 'audioonly',
            quality: 'highestaudio'
        });

        // Alirkan langsung ke frontend
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
        return res.status(500).json({ error: 'Gagal memproses video dari YouTube', details: error.message });
    }
};
