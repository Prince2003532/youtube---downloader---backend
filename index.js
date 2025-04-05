const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const qr = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/download', async (req, res) => {
  const { url, quality, format } = req.query;

  if (!url || !ytdl.validateURL(url)) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  try {
    const info = await ytdl.getInfo(url);
    let formats;

    if (format === 'mp3') {
      formats = info.formats.filter(f => f.mimeType.includes('audio'));
    } else {
      formats = info.formats.filter(f => f.hasVideo && f.hasAudio);
    }

    let videoUrl = formats[0].url;

    if (quality) {
      const selectedFormat = formats.find(f => f.qualityLabel === quality);
      if (selectedFormat) videoUrl = selectedFormat.url;
    }

    const qrCode = await qr.toDataURL(videoUrl);

    res.json({ downloadUrl: videoUrl, qrCode });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching video' });
  }
});

app.listen(PORT, () => {
  console.log(`Advanced YouTube Video Downloader running on port ${PORT}`);
});