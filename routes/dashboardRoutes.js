const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

// GET /api/dashboard/overview
router.get('/overview', verifyToken, async (req, res) => {

  try {

    const queries = {
      products: 'SELECT COUNT(*) AS total FROM products',
      blogs: 'SELECT COUNT(*) AS total FROM blogs',
      gallery: 'SELECT COUNT(*) AS total FROM gallery',
      faqs: 'SELECT COUNT(*) AS total FROM faqs',
      testimonials: 'SELECT COUNT(*) AS total FROM testimonials',
      partners: 'SELECT COUNT(*) AS total FROM partners',
      contactMessages: 'SELECT COUNT(*) AS total FROM contact_messages',
      quoteRequests: 'SELECT COUNT(*) AS total FROM quote_requests',
      comments: 'SELECT COUNT(*) AS total FROM comments',
      pendingComments: "SELECT COUNT(*) AS total FROM comments WHERE status = 'pending'"
    };

    const runQuery = (sql) =>
      new Promise((resolve, reject) => {
        db.query(sql, (err, results) => {
          if (err) return reject(err);
          resolve(results[0].total);
        });
      });

    const runRowsQuery = (sql) =>
      new Promise((resolve, reject) => {
        db.query(sql, (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });

    const stats = {};

    for (const key in queries) {
      stats[key] = await runQuery(queries[key]);
    }

    const recentComments = await runRowsQuery(`
      SELECT
        id,
        name,
        email,
        comment,
        page,
        status,
        created_at
      FROM comments
      ORDER BY created_at DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      stats,
      recentComments
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard statistics'
    });
  }
});

module.exports = router;
