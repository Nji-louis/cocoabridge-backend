const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

// GET /api/admin/products
router.get('/', verifyToken, (req, res) => {

  db.query(
    'SELECT * FROM products ORDER BY created_at DESC',
    (err, results) => {

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
    }
  );
});

// POST /api/admin/products
router.post('/', verifyToken, (req, res) => {

  const {
    name,
    slug,
    category,
    short_description,
    description,
    image_url,
    video_url,
    origin_country,
    packaging,
    min_order,
    featured,
    status
  } = req.body;

  if (!name || !slug || !category) {
    return res.status(400).json({
      success: false,
      message: 'Name, slug and category are required'
    });
  }

  const sql = `
    INSERT INTO products (
      name,
      slug,
      category,
      short_description,
      description,
      image_url,
      video_url,
      origin_country,
      packaging,
      min_order,
      featured,
      status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    name,
    slug,
    category,
    short_description || '',
    description || '',
    image_url || '',
    video_url || '',
    origin_country || 'Cameroon',
    packaging || '',
    min_order || '',
    featured ? 1 : 0,
    status || 'active'
  ];

  db.query(sql, values, (err, result) => {

    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: 'Failed to create product'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      id: result.insertId
    });
  });
});

// PUT /api/admin/products/:id
router.put('/:id', verifyToken, (req, res) => {

  const {
    name,
    slug,
    category,
    short_description,
    description,
    image_url,
    video_url,
    origin_country,
    packaging,
    min_order,
    featured,
    status
  } = req.body;

  const sql = `
    UPDATE products SET
      name = ?,
      slug = ?,
      category = ?,
      short_description = ?,
      description = ?,
      image_url = ?,
      video_url = COALESCE(?, video_url),
      origin_country = ?,
      packaging = ?,
      min_order = ?,
      featured = ?,
      status = ?
    WHERE id = ?
  `;

  const values = [
    name,
    slug,
    category,
    short_description || '',
    description || '',
    image_url || '',
    video_url || null,
    origin_country || 'Cameroon',
    packaging || '',
    min_order || '',
    featured ? 1 : 0,
    status || 'active',
    req.params.id
  ];

  db.query(sql, values, (err) => {

    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: 'Failed to update product'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully'
    });
  });
});

// DELETE /api/admin/products/:id
router.delete('/:id', verifyToken, (req, res) => {

  db.query(
    'DELETE FROM products WHERE id = ?',
    [req.params.id],
    (err) => {

      if (err) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: 'Failed to delete product'
        });
      }

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    }
  );
});

module.exports = router;