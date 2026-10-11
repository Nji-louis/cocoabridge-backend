const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

// Dashboard statistics
router.get('/dashboard', verifyToken, async (req, res) => {
  try {
    const query = (sql) =>
      new Promise((resolve, reject) => {
        db.query(sql, (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

    const [
      products,
      blogs,
      gallery,
      faqs,
      testimonials,
      partners,
      contactMessages,
      quoteRequests
    ] = await Promise.all([
      query('SELECT COUNT(*) AS total FROM products'),
      query('SELECT COUNT(*) AS total FROM blogs'),
      query('SELECT COUNT(*) AS total FROM gallery'),
      query('SELECT COUNT(*) AS total FROM faqs'),
      query('SELECT COUNT(*) AS total FROM testimonials'),
      query('SELECT COUNT(*) AS total FROM partners'),
      query('SELECT COUNT(*) AS total FROM contact_messages'),
      query('SELECT COUNT(*) AS total FROM quote_requests')
    ]);

    res.json({
      success: true,
      stats: {
        products: products[0].total,
        blogs: blogs[0].total,
        gallery: gallery[0].total,
        faqs: faqs[0].total,
        testimonials: testimonials[0].total,
        partners: partners[0].total,
        contactMessages: contactMessages[0].total,
        quoteRequests: quoteRequests[0].total
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
});

module.exports = router;









