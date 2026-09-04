const express = require('express');
const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const extractSongId = (sunoUrl) => {
  try {
    const urlObj = new URL(sunoUrl);
    const pathParts = urlObj.pathname.split('/');
    return pathParts[pathParts.indexOf('song') + 1] || null;
  } catch (err) {
    return null;
  }
};

const downloadSong = async (url, targetDir) => {
  const songId = extractSongId(url);

  if (!songId) {
    console.error(`Invalid Suno URL: ${url}`);
    return;
  }

  const directUrl = `https://cdn1.suno.ai/${songId}.mp3`;
  const filename = `${songId}.mp3`;

  try {
    const response = await fetch(directUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'audio/mpeg, audio/*;q=0.9, */*;q=0.8'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const destPath = path.join(targetDir, filename);

    await fs.writeFile(destPath, buffer);
    console.log(`Downloaded: ${filename}`);
  } catch (error) {
    console.error(`Failed to download ${filename}:`, error.message);
  }
};

app.post('/api/bulk-download', async (req, res) => {
  const { folderName, songs } = req.body;

  if (!folderName || !Array.isArray(songs)) {
    return res.status(400).json({ error: 'Invalid payload provided' });
  }

  const baseDir = path.join(__dirname, 'downloads');
  const targetDir = path.join(baseDir, folderName);

  if (!fsSync.existsSync(baseDir)) {
    fsSync.mkdirSync(baseDir);
  }

  if (!fsSync.existsSync(targetDir)) {
    fsSync.mkdirSync(targetDir);
  }

  res.status(202).json({ message: `Download process started for folder: ${folderName}` });

  for (const url of songs) {
    if (url) {
      await downloadSong(url, targetDir);
    }
  }
  
  console.log(`All downloads finished for folder: ${folderName}`);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
