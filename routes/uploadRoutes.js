const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { verifyToken, verifyAdminOrEditor } =
  require('../middleware/authMiddleware');


// =====================================================
// PRODUCT IMAGE UPLOAD DIRECTORY
// =====================================================

const uploadDir = path.join(
  __dirname,
  '../uploads/products'
);



const videoUploadDir = path.join(
  __dirname,
  '../uploads/products/videos'
);

if (!fs.existsSync(videoUploadDir)) {
  fs.mkdirSync(videoUploadDir, {
    recursive: true
  });
}



// Create directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true
  });
}


// =====================================================
// MULTER STORAGE
// =====================================================

const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {

    const ext =
      path.extname(file.originalname);

    const filename =
      Date.now() +
      '-' +
      Math.round(Math.random() * 1e9) +
      ext;

    cb(null, filename);
  }

});


// =====================================================
// FILE FILTER
// =====================================================

const fileFilter = (req, file, cb) => {

  if (file.mimetype.startsWith('image/')) {

    cb(null, true);

  } else {

    cb(
      new Error('Only image files are allowed')
    );

  }

};


// =====================================================
// MULTER CONFIGURATION
// =====================================================

const upload = multer({

  storage,

  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024
  }

});



const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, videoUploadDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    const allowedExtensions = [
      '.mp4',
      '.webm',
      '.mov'
    ];

    if (!allowedExtensions.includes(ext)) {
      return cb(new Error('Unsupported video extension'));
    }

    const filename =
      Date.now() +
      '-' +
      Math.round(Math.random() * 1e9) +
      ext;

    cb(null, filename);
  }
});

const videoUpload = multer({
  storage: videoStorage,

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'video/mp4',
      'video/webm',
      'video/quicktime'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      return cb(null, true);
    }

    cb(new Error('Only MP4, WebM, and MOV videos are allowed'));
  },

  limits: {
    fileSize: 100 * 1024 * 1024
  }
});


// =====================================================
// POST /api/uploads
// Upload product image
// =====================================================
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


      
// Physical file:
      // uploads/products/
      //
      // Public URL:
      // /uploads/products/

      const imageUrl =
        `/uploads/products/${req.file.filename}`;

      console.log(
        'Product image uploaded:',
        imageUrl
      );

      return res.json({
        success: true,
        imageUrl
      });

    } catch (error) {
      console.error(
        'Upload error:',
        error
      );

      return res.status(500).json({
        success: false,
        message: 'Image upload failed'
      });
    }
  }
);



router.post(
  '/video',
  verifyToken,
  verifyAdminOrEditor,
  videoUpload.single('video'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video uploaded'
      });
    }

    const videoUrl =
      `/uploads/products/videos/${req.file.filename}`;

    console.log('Product video uploaded:', videoUrl);

    return res.json({
      success: true,
      videoUrl
    });
  }
);




module.exports = router;