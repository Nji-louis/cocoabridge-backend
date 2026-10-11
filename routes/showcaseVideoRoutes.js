const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken, verifyAdminOrEditor } =
  require('../middleware/authMiddleware');

const videoDir = path.join(__dirname, '../uploads/showcase-videos');
const settingsFile = path.join(__dirname, '../config/showcase-video.json');

fs.mkdirSync(videoDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, videoDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.mp4', '.webm', '.mov'];

    if (!allowed.includes(ext)) {
      return cb(new Error('Use an MP4, WebM, or MOV video.'));
    }

    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Only MP4, WebM, and MOV videos are allowed.'));
  },
  limits: { fileSize: 100 * 1024 * 1024 }
});

function readSettings() {
  try {
    return JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return { videoUrl: null };
    throw error;
  }
}

// Public: get the currently selected showcase video.
router.get('/', (req, res) => {
  try {
    res.json({ success: true, ...readSettings() });
  } catch (error) {
    console.error('Showcase settings read failed:', error);
    res.status(500).json({
      success: false,
      message: 'Could not read showcase video settings.'
    });
  }
});

// Admin/editor: upload and select the showcase video.
router.post(
  '/upload',
  verifyToken,
  verifyAdminOrEditor,
  upload.single('video'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select a video to upload.'
      });
    }

    const videoUrl = `/uploads/showcase-videos/${req.file.filename}`;

    try {
      fs.writeFileSync(
        settingsFile,
        JSON.stringify({ videoUrl }, null, 2) + '\n',
        'utf8'
      );

      res.json({ success: true, videoUrl });
    } catch (error) {
      console.error('Showcase settings save failed:', error);
      res.status(500).json({
        success: false,
        message: 'Video uploaded, but its selection could not be saved.'
      });
    }
  }
);

module.exports = router;
