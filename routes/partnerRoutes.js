const express = require('express');
const router = express.Router();

const db = require('../config/db');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// ======================================================
// PUBLIC - GET ACTIVE PARTNERS
// GET /api/partners
// ======================================================

router.get('/', (req, res) => {

  const sql = `
    SELECT *
    FROM partners
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
      partners: results
    });

  });

});


// ======================================================
// ADMIN - GET ALL PARTNERS
// GET /api/partners/admin/all
// ======================================================

router.get('/admin/all', verifyToken, verifyAdmin, (req, res) => {

  const sql = `
    SELECT *
    FROM partners
    ORDER BY sort_order ASC, id DESC
  `;

  db.query(sql, (err, results) => {

    if (err) {
      console.error(err);

      return res.status(500).json({
        success: false,
        message: 'Failed to load partners'
      });
    }

    res.json({
      success: true,
      partners: results
    });

  });

});


// ======================================================
// ADMIN - CREATE PARTNER
// POST /api/partners/admin
// ======================================================

router.post('/admin', verifyToken, verifyAdmin, (req, res) => {

  const {
    name,
    logo_url,
    website_url,
    sort_order,
    status
  } = req.body;

  if (!name || !name.trim()) {

    return res.status(400).json({
      success: false,
      message: 'Partner name is required'
    });

  }

  const sql = `
    INSERT INTO partners
    (
      name,
      logo_url,
      website_url,
      sort_order,
      status
    )
    VALUES (?, ?, ?, ?, ?)
  `;

  const values = [
    name.trim(),
    logo_url || '',
    website_url || '#',
    Number(sort_order) || 0,
    status || 'active'
  ];

  db.query(sql, values, (err, result) => {

    if (err) {
      console.error(err);

      return res.status(500).json({
        success: false,
        message: 'Failed to create partner'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Partner created successfully',
      partnerId: result.insertId
    });

  });

});


// ======================================================
// ADMIN - UPDATE PARTNER
// PUT /api/partners/admin/:id
// ======================================================

router.put('/admin/:id', verifyToken, verifyAdmin, (req, res) => {

  const { id } = req.params;

  const {
    name,
    logo_url,
    website_url,
    sort_order,
    status
  } = req.body;

  if (!name || !name.trim()) {

    return res.status(400).json({
      success: false,
      message: 'Partner name is required'
    });

  }

  const sql = `
    UPDATE partners
    SET
      name = ?,
      logo_url = ?,
      website_url = ?,
      sort_order = ?,
      status = ?
    WHERE id = ?
  `;

  const values = [
    name.trim(),
    logo_url || '',
    website_url || '#',
    Number(sort_order) || 0,
    status || 'active',
    id
  ];

  db.query(sql, values, (err, result) => {

    if (err) {
      console.error(err);

      return res.status(500).json({
        success: false,
        message: 'Failed to update partner'
      });
    }

    if (result.affectedRows === 0) {

      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });

    }

    res.json({
      success: true,
      message: 'Partner updated successfully'
    });

  });

});


// ======================================================
// ADMIN - DELETE PARTNER
// DELETE /api/partners/admin/:id
// ======================================================

router.delete('/admin/:id', verifyToken, verifyAdmin, (req, res) => {

  const { id } = req.params;

  db.query(
    'DELETE FROM partners WHERE id = ?',
    [id],
    (err, result) => {

      if (err) {
        console.error(err);

        return res.status(500).json({
          success: false,
          message: 'Failed to delete partner'
        });
      }

      if (result.affectedRows === 0) {

        return res.status(404).json({
          success: false,
          message: 'Partner not found'
        });

      }

      res.json({
        success: true,
        message: 'Partner deleted successfully'
      });

    }
  );

});


module.exports = router;