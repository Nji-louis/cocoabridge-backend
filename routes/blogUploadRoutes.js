const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
  verifyToken,
  verifyAdminOrEditor
} = require('../middleware/authMiddleware');

const uploadDir = path.join(
  __dirname,
  '../uploads/blogs'
);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true
  });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    const filename =
      Date.now() +
      '-' +
      Math.round(Math.random() * 1e9) +
      ext;

    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

router.post(
  '/',
  verifyToken,
  verifyAdminOrEditor,
  upload.single('image'),
  (req, res) => {

    try {

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image uploaded'
        });
      }

      const imageUrl =
        `/uploads/blogs/${req.file.filename}`;

      console.log(
        'Blog image uploaded:',
        imageUrl
      );

      return res.json({
        success: true,
        imageUrl
      });

    } catch (error) {

      console.error(
        'Blog upload error:',
        error
      );

      return res.status(500).json({
        success: false,
        message: 'Blog image upload failed'
      });

    }

  }
);

module.exports = router;