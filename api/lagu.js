const ytdl = require('@distube/ytdl-core');

export default async function handler(req, res) {
    // 1. SETUP CORS (SANGAT PENTING)
    // Agar frontend base44/React Anda diizinkan mengakses API ini tanpa error "CORS Blocked"
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); // Mengizinkan semua domain
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Handle Preflight Request dari Browser
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Hanya menerima method GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed. Gunakan GET.' });
    }

    // 2. TANGKAP ID DARI URL
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'ID YouTube wajib disertakan. Contoh: /api/lagu?id=xxxxx' });
    }

    const url = `https://www.youtube.com/watch?v=${id}`;

    // Validasi URL/ID
    if (!ytdl.validateURL(url)) {
        return res.status(400).json({ error: 'ID YouTube tidak valid atau video tidak ditemukan.' });
    }

    try {
        // 3. AMBIL METADATA VIDEO (Untuk nama file)
        const info = await ytdl.getInfo(url);
        
        // Bersihkan judul dari karakter aneh/emoji agar tidak membuat error di sistem operasi saat disimpan
        let title = info.videoDetails.title.replace(/[^\w\s-]/gi, '').trim();
        if (!title) title = "Audio_Track"; // Fallback nama jika judul kosong setelah dibersihkan

        // 4. SET HEADER UNTUK AUTO-DOWNLOAD
        // Memaksa browser menganggap respons ini sebagai file attachment .mp3
        res.setHeader('Content-Disposition', `attachment; filename="FahmiMp3 - ${title}.mp3"`);
        res.setHeader('Content-Type', 'audio/mpeg');

        // 5. PROSES STREAMING & DOWNLOAD
        // Mengambil audio dengan kualitas terbaik
        const audioStream = ytdl(url, {
            filter: 'audioonly',
            quality: 'highestaudio'
        });

        // Mengalirkan (pipe) data audio dari YouTube langsung ke response browser
        audioStream.pipe(res);

        // Menangani jika terjadi error di tengah-tengah streaming
        audioStream.on('error', (err) => {
            console.error('Streaming Error:', err);
            // Jika header belum terkirim, kirim pesan error. Jika sudah, tutup koneksi.
            if (!res.headersSent) {
                res.status(500).json({ error: 'Terjadi kesalahan saat memproses audio stream.' });
            } else {
                res.end();
            }
        });

    } catch (error) {
        console.error('Server Error:', error.message);
        // Tangkap error seperti video di-private, dibatasi umur, dsb.
        return res.status(500).json({ 
            error: 'Gagal memproses video.', 
            details: error.message 
        });
    }
}
