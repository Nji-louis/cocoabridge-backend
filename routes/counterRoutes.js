const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// ======================================================
// PUBLIC - GET ACTIVE COUNTERS
// GET /api/counters
// ======================================================

router.get('/', (req, res) => {

  const sql = `
    SELECT *
    FROM counters
    WHERE status = 'active'
    ORDER BY sort_order ASC
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
      counters: results
    });

  });

});


// ======================================================
// ADMIN - GET ALL COUNTERS
// GET /api/counters/admin/all
// ======================================================

router.get('/admin/all', verifyToken, verifyAdmin, (req, res) => {

  db.query(
    'SELECT * FROM counters ORDER BY sort_order ASC',
    (err, results) => {

      if (err) {
        console.error(err);

        return res.status(500).json({
          success: false,
          message: 'Failed to load counters'
        });
      }

      res.json({
        success: true,
        counters: results
      });

    }
  );

});


// ======================================================
// ADMIN - CREATE COUNTER
// POST /api/counters/admin
// ======================================================

router.post('/admin', verifyToken, verifyAdmin, (req, res) => {

  const {
    title,
    value,
    icon,
    sort_order,
    status
  } = req.body;

  if (!title || value === undefined || value === null) {

    return res.status(400).json({
      success: false,
      message: 'Title and value are required'
    });

  }

  const sql = `
    INSERT INTO counters
    (
      title,
      value,
      icon,
      sort_order,
      status
    )
    VALUES (?, ?, ?, ?, ?)
  `;

  const values = [
    title.trim(),
    Number(value),
    icon || 'fa-bar-chart',
    Number(sort_order) || 0,
    status || 'active'
  ];

  db.query(sql, values, (err, result) => {

    if (err) {
      console.error(err);

      return res.status(500).json({
        success: false,
        message: 'Failed to create counter'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Counter created successfully',
      counterId: result.insertId
    });

  });

});


// ======================================================
// ADMIN - UPDATE COUNTER
// PUT /api/counters/admin/:id
// ======================================================

router.put('/admin/:id', verifyToken, verifyAdmin, (req, res) => {

  const { id } = req.params;

  const {
    title,
    value,
    icon,
    sort_order,
    status
  } = req.body;

  if (!title || value === undefined || value === null) {

    return res.status(400).json({
      success: false,
      message: 'Title and value are required'
    });

  }

  const sql = `
    UPDATE counters
    SET
      title = ?,
      value = ?,
      icon = ?,
      sort_order = ?,
      status = ?
    WHERE id = ?
  `;

  const values = [
    title.trim(),
    Number(value),
    icon || 'fa-bar-chart',
    Number(sort_order) || 0,
    status || 'active',
    id
  ];

  db.query(sql, values, (err, result) => {

    if (err) {
      console.error(err);

      return res.status(500).json({
        success: false,
        message: 'Failed to update counter'
      });
    }

    if (result.affectedRows === 0) {

      return res.status(404).json({
        success: false,
        message: 'Counter not found'
      });

    }

    res.json({
      success: true,
      message: 'Counter updated successfully'
    });

  });

});


// ======================================================
// ADMIN - DELETE COUNTER
// DELETE /api/counters/admin/:id
// ======================================================

router.delete('/admin/:id', verifyToken, verifyAdmin, (req, res) => {

  const { id } = req.params;

  db.query(
    'DELETE FROM counters WHERE id = ?',
    [id],
    (err, result) => {

      if (err) {
        console.error(err);

        return res.status(500).json({
          success: false,
          message: 'Failed to delete counter'
        });
      }

      if (result.affectedRows === 0) {

        return res.status(404).json({
          success: false,
          message: 'Counter not found'
        });

      }

      res.json({
        success: true,
        message: 'Counter deleted successfully'
      });

    }
  );

});


module.exports = router;