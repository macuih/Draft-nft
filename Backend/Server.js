// backend/server.js
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const pinataSDK = require('@pinata/sdk');

const app = express();
const upload = multer({ dest: 'uploads/' });
const port = 5000;

app.use(cors());
app.use(express.json());

const PinataClient = require('@pinata/sdk');
const pinata = new PinataClient({ pinataJWTKey: process.env.PINATA_JWT }); 

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const fileStream = fs.createReadStream(req.file.path);
    const fileResult = await pinata.pinFileToIPFS(fileStream);
    fs.unlinkSync(req.file.path); // Clean up

    const { name, description } = req.body;

    const metadata = {
      name,
      description,
      image: `ipfs://${fileResult.IpfsHash}`,
    };

    const jsonResult = await pinata.pinJSONToIPFS(metadata);
    res.json({ tokenURI: `ipfs://${jsonResult.IpfsHash}` });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to upload to IPFS' });
  }
});

app.listen(port, () => {
  console.log(`Pinata upload server running on http://localhost:${port}`);
});
