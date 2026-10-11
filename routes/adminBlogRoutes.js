const express = require('express');
const router = express.Router();
const db = require('../config/db');

const {
  verifyToken,
  verifyAdminOrEditor,
} = require('../middleware/authMiddleware');


// GET ALL BLOG POSTS
router.get(
  '/',
  verifyToken,
  verifyAdminOrEditor,
  (req, res) => {

    const sql = `
      SELECT *
      FROM blogs
      ORDER BY created_at DESC
    `;

    db.query(sql, (err, results) => {

      if (err) {
        console.error('Admin blogs GET error:', err);

        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      res.json({
        success: true,
        blogs: results
      });

    });
  }
);


// CREATE BLOG POST
router.post(
  '/',
  verifyToken,
verifyAdminOrEditor,
  (req, res) => {

    const {
      title,
      slug,
      excerpt,
      content,
      featured_image,
      author,
      status
    } = req.body;

    if (!title || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Title and slug are required'
      });
    }

    const sql = `
      INSERT INTO blogs
      (
        title,
        slug,
        excerpt,
        content,
        featured_image,
        author,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      title,
      slug,
      excerpt || '',
      content || '',
      featured_image || '',
      author || 'COCOABRIDGE Ltd',
      status || 'published'
    ];

    db.query(sql, values, (err, result) => {

      if (err) {
        console.error('Admin blog CREATE error:', err);

        return res.status(500).json({
          success: false,
          message: 'Failed to create blog post'
        });
      }

      res.status(201).json({
        success: true,
        message: 'Blog post created successfully',
        id: result.insertId
      });

    });
  }
);


// UPDATE BLOG POST
router.put(
  '/:id',
 verifyToken,
verifyAdminOrEditor,
  (req, res) => {

    const { id } = req.params;

    const {
      title,
      slug,
      excerpt,
      content,
      featured_image,
      author,
      status
    } = req.body;

    if (!title || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Title and slug are required'
      });
    }

    const sql = `
      UPDATE blogs
      SET
        title = ?,
        slug = ?,
        excerpt = ?,
        content = ?,
        featured_image = ?,
        author = ?,
        status = ?
      WHERE id = ?
    `;

    const values = [
      title,
      slug,
      excerpt || '',
      content || '',
      featured_image || '',
      author || 'COCOABRIDGE Ltd',
      status || 'published',
      id
    ];

    db.query(sql, values, (err, result) => {

      if (err) {
        console.error('Admin blog UPDATE error:', err);

        return res.status(500).json({
          success: false,
          message: 'Failed to update blog post'
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Blog post not found'
        });
      }

      res.json({
        success: true,
        message: 'Blog post updated successfully'
      });

    });
  }
);


// DELETE BLOG POST
router.delete(
  '/:id',
  verifyToken,
verifyAdminOrEditor,
  (req, res) => {

    const { id } = req.params;

    const sql = `
      DELETE FROM blogs
      WHERE id = ?
    `;

    db.query(sql, [id], (err, result) => {

      if (err) {
        console.error('Admin blog DELETE error:', err);

        return res.status(500).json({
          success: false,
          message: 'Failed to delete blog post'
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Blog post not found'
        });
      }

      res.json({
        success: true,
        message: 'Blog post deleted successfully'
      });

    });
  }
);


module.exports = router;