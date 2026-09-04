const express = require('express');
const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const getSunoDirectUrl = (sunoUrl) => {
  try {
    const urlObj = new URL(sunoUrl);
    const pathParts = urlObj.pathname.split('/');
    const songId = pathParts[pathParts.indexOf('song') + 1];
    
    if (!songId) return null;
    
    return `https://cdn1.suno.ai/${songId}.mp3`;
  } catch (err) {
    return null;
  }
};

const downloadSong = async (filename, url, targetDir) => {
  const directUrl = getSunoDirectUrl(url);

  if (!directUrl) {
    console.error(`Invalid Suno URL for ${filename}`);
    return;
  }

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

  for (const song of songs) {
    if (song.filename && song.url) {
      await downloadSong(song.filename, song.url, targetDir);
    }
  }
  
  console.log(`All downloads finished for folder: ${folderName}`);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
