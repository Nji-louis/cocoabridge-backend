const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// ======================================================
// PUBLIC - GET ACTIVE FAQS
// GET /api/faqs
// ======================================================

router.get('/', (req, res) => {

  const sql = `
    SELECT *
    FROM faqs
    WHERE status = 'active'
    ORDER BY sort_order ASC, created_at ASC
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
      faqs: results
    });

  });

});


// ======================================================
// ADMIN - GET ALL FAQS
// GET /api/faqs/admin/all
// ======================================================

router.get('/admin/all', verifyToken, verifyAdmin, (req, res) => {

  const sql = `
    SELECT *
    FROM faqs
    ORDER BY sort_order ASC, created_at ASC
  `;

  db.query(sql, (err, results) => {

    if (err) {
      console.error(err);

      return res.status(500).json({
        success: false,
        message: 'Failed to load FAQs'
      });
    }

    res.json({
      success: true,
      faqs: results
    });

  });

});


// ======================================================
// ADMIN - CREATE FAQ
// POST /api/faqs/admin
// ======================================================

router.post('/admin', verifyToken, verifyAdmin, (req, res) => {

  const {
    question,
    answer,
    category,
    sort_order,
    status
  } = req.body;

  if (!question || !answer) {

    return res.status(400).json({
      success: false,
      message: 'Question and answer are required'
    });

  }

  const sql = `
    INSERT INTO faqs
    (
      question,
      answer,
      category,
      sort_order,
      status
    )
    VALUES (?, ?, ?, ?, ?)
  `;

  const values = [
    question.trim(),
    answer.trim(),
    category || 'General',
    Number(sort_order) || 0,
    status || 'active'
  ];

  db.query(sql, values, (err, result) => {

    if (err) {
      console.error(err);

      return res.status(500).json({
        success: false,
        message: 'Failed to create FAQ'
      });
    }

    res.status(201).json({
      success: true,
      message: 'FAQ created successfully',
      faqId: result.insertId
    });

  });

});


// ======================================================
// ADMIN - UPDATE FAQ
// PUT /api/faqs/admin/:id
// ======================================================

router.put('/admin/:id', verifyToken, verifyAdmin, (req, res) => {

  const { id } = req.params;

  const {
    question,
    answer,
    category,
    sort_order,
    status
  } = req.body;

  if (!question || !answer) {

    return res.status(400).json({
      success: false,
      message: 'Question and answer are required'
    });

  }

  const sql = `
    UPDATE faqs
    SET
      question = ?,
      answer = ?,
      category = ?,
      sort_order = ?,
      status = ?
    WHERE id = ?
  `;

  const values = [
    question.trim(),
    answer.trim(),
    category || 'General',
    Number(sort_order) || 0,
    status || 'active',
    id
  ];

  db.query(sql, values, (err, result) => {

    if (err) {
      console.error(err);

      return res.status(500).json({
        success: false,
        message: 'Failed to update FAQ'
      });
    }

    if (result.affectedRows === 0) {

      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });

    }

    res.json({
      success: true,
      message: 'FAQ updated successfully'
    });

  });

});


// ======================================================
// ADMIN - DELETE FAQ
// DELETE /api/faqs/admin/:id
// ======================================================

router.delete('/admin/:id', verifyToken, verifyAdmin, (req, res) => {

  const { id } = req.params;

  db.query(
    'DELETE FROM faqs WHERE id = ?',
    [id],
    (err, result) => {

      if (err) {
        console.error(err);

        return res.status(500).json({
          success: false,
          message: 'Failed to delete FAQ'
        });
      }

      if (result.affectedRows === 0) {

        return res.status(404).json({
          success: false,
          message: 'FAQ not found'
        });

      }

      res.json({
        success: true,
        message: 'FAQ deleted successfully'
      });

    }
  );

});


module.exports = router;