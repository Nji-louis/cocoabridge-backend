const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/products
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM products WHERE status = "active" ORDER BY created_at DESC';

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
      products: results
    });
  });
});


// GET /api/products/category/:category
router.get('/category/:category', (req, res) => {
  const sql = 'SELECT * FROM products WHERE category = ? AND status = "active"';

  db.query(sql, [req.params.category], (err, results) => {
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
      products: results
    });
  });
});


// GET /api/products/featured
router.get('/featured', (req, res) => {
  const sql = `
    SELECT * FROM products
    WHERE featured = 1 AND status = "active"
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
      products: results
    });
  });
});


// GET /api/products/:slug
router.get('/:slug', (req, res) => {
  const sql = 'SELECT * FROM products WHERE slug = ? AND status = "active" LIMIT 1';

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
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      product: results[0]
    });
  });
});

module.exports = router;