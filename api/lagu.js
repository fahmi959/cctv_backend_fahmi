// Ganti seluruh isi api/lagu.js dengan kode ini:

const ytdl = require('@distube/ytdl-core');

// Gunakan module.exports, BUKAN export default
module.exports = async function handler(req, res) {
    // 1. SETUP CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed. Gunakan GET.' });
    }

    // 2. TANGKAP ID
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'ID YouTube wajib disertakan.' });
    }

    const url = `https://www.youtube.com/watch?v=${id}`;

    if (!ytdl.validateURL(url)) {
        return res.status(400).json({ error: 'ID YouTube tidak valid.' });
    }

    try {
        const info = await ytdl.getInfo(url);
        
        let title = info.videoDetails.title.replace(/[^\w\s-]/gi, '').trim();
        if (!title) title = "Audio_Track";

        // 4. SET HEADER AUTO-DOWNLOAD
        res.setHeader('Content-Disposition', `attachment; filename="FahmiMp3 - ${title}.mp3"`);
        res.setHeader('Content-Type', 'audio/mpeg');

        // 5. PROSES STREAMING
        const audioStream = ytdl(url, {
            filter: 'audioonly',
            quality: 'highestaudio'
        });

        audioStream.pipe(res);

        audioStream.on('error', (err) => {
            console.error('Streaming Error:', err);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Terjadi kesalahan streaming.' });
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
};
