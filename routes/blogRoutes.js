const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/blogs
router.get('/', (req, res) => {
  const sql = `
    SELECT id, title, slug, excerpt, featured_image, author, published_at
    FROM blogs
    WHERE status = 'published'
    ORDER BY published_at DESC
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
      blogs: results
    });
  });
});

// GET /api/blogs/:slug
router.get('/:slug', (req, res) => {
  const sql = `
    SELECT *
    FROM blogs
    WHERE slug = ? AND status = 'published'
    LIMIT 1
  `;

  db.query(sql, [req.params.slug], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.json({
      success: true,
      blog: results[0]
    });
  });
});

module.exports = router;