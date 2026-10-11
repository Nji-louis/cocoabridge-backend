const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/gallery
router.get('/', (req, res) => {
  const sql = `
    SELECT *
    FROM gallery
    WHERE status = 'active'
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    res.json({
      success: true,
      count: results.length,
      images: results
    });
  });
});

// GET /api/gallery/featured
router.get('/featured', (req, res) => {
  const sql = `
    SELECT *
    FROM gallery
    WHERE featured = 1 AND status = 'active'
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    res.json({
      success: true,
      count: results.length,
      images: results
    });
  });
});

module.exports = router;