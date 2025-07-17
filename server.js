require('dotenv').config();
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

const upload = multer({ dest: 'uploads/' });
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/grade', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
  const imgPath = req.file.path;
  try {
    const buffer = fs.readFileSync(imgPath);
    const base64 = buffer.toString('base64');

    const apiKey = process.env.JIGSAW_API_KEY;
    const headers = { 'x-api-key': apiKey };

    // Detect stars and text using object detection
    const detectRes = await axios.post(
      'https://jigsawstack.com/api/ai/object-detection/v1/detect',
      { image: base64, objects: ['star', 'text'] },
      { headers }
    );
    const detections = detectRes.data.detections || [];

    // OCR using VOCR API
    const ocrRes = await axios.post(
      'https://jigsawstack.com/api/ai/vocr/v1/detect',
      { image: base64 },
      { headers }
    );
    const texts = ocrRes.data.texts || [];

    // Annotate image
    const img = await Jimp.read(buffer);
    const starColor = Jimp.rgbaToInt(255, 0, 0, 80);
    const textColor = Jimp.rgbaToInt(0, 255, 0, 80);
    for (const d of detections) {
      const b = d.bounding_box;
      const rect = new Jimp(b.width, b.height, starColor);
      img.composite(rect, b.x, b.y);
    }
    for (const t of texts) {
      const b = t.bounding_box;
      const rect = new Jimp(b.width, b.height, textColor);
      img.composite(rect, b.x, b.y);
    }

    const outPath = path.join('uploads', `annotated-${req.file.filename}.png`);
    await img.writeAsync(outPath);
    res.sendFile(path.resolve(outPath), () => {
      fs.unlinkSync(imgPath);
      // keep annotated image
    });
  } catch (err) {
    console.error(err);
    fs.unlinkSync(imgPath);
    res.status(500).json({ error: 'Failed to process image' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
