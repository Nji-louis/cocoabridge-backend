const express = require('express');
const router = express.Router();

const db = require('../config/db');

const {
  verifyToken,
  verifyAdmin
} = require('../middleware/authMiddleware');


// PUBLIC — GET ACTIVE TEAM MEMBERS
router.get('/', (req, res) => {
  const sql = `
    SELECT
      id,
      name,
      role,
      description,
      image_url,
      linkedin_url,
      email,
      sort_order
    FROM team_members
    WHERE status = 'active'
    ORDER BY sort_order ASC, id ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Team GET error:', err);

      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    res.json({
      success: true,
      count: results.length,
      members: results
    });
  });
});


// ADMIN — GET ALL TEAM MEMBERS
router.get('/admin/all', verifyToken, verifyAdmin, (req, res) => {
  const sql = `
    SELECT *
    FROM team_members
    ORDER BY sort_order ASC, id ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Team admin GET error:', err);

      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    res.json({
      success: true,
      count: results.length,
      members: results
    });
  });
});


// ADMIN — CREATE TEAM MEMBER
router.post('/admin', verifyToken, verifyAdmin, (req, res) => {
  const {
    name,
    role,
    description,
    image_url,
    linkedin_url,
    email,
    sort_order,
    status
  } = req.body;

  if (!name || !role) {
    return res.status(400).json({
      success: false,
      message: 'Name and role are required'
    });
  }

  const sql = `
    INSERT INTO team_members
    (
      name,
      role,
      description,
      image_url,
      linkedin_url,
      email,
      sort_order,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    name,
    role,
    description || null,
    image_url || null,
    linkedin_url || null,
    email || null,
    Number(sort_order) || 0,
    status === 'inactive' ? 'inactive' : 'active'
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Team create error:', err);

      return res.status(500).json({
        success: false,
        message: 'Failed to create team member'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Team member created successfully',
      id: result.insertId
    });
  });
});


// ADMIN — UPDATE TEAM MEMBER
router.put('/admin/:id', verifyToken, verifyAdmin, (req, res) => {
  const { id } = req.params;

  const {
    name,
    role,
    description,
    image_url,
    linkedin_url,
    email,
    sort_order,
    status
  } = req.body;

  if (!name || !role) {
    return res.status(400).json({
      success: false,
      message: 'Name and role are required'
    });
  }

  const sql = `
    UPDATE team_members
    SET
      name = ?,
      role = ?,
      description = ?,
      image_url = ?,
      linkedin_url = ?,
      email = ?,
      sort_order = ?,
      status = ?
    WHERE id = ?
  `;

  const values = [
    name,
    role,
    description || null,
    image_url || null,
    linkedin_url || null,
    email || null,
    Number(sort_order) || 0,
    status === 'inactive' ? 'inactive' : 'active',
    id
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Team update error:', err);

      return res.status(500).json({
        success: false,
        message: 'Failed to update team member'
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    res.json({
      success: true,
      message: 'Team member updated successfully'
    });
  });
});


// ADMIN — DELETE TEAM MEMBER
router.delete('/admin/:id', verifyToken, verifyAdmin, (req, res) => {
  const { id } = req.params;

  db.query(
    'DELETE FROM team_members WHERE id = ?',
    [id],
    (err, result) => {
      if (err) {
        console.error('Team delete error:', err);

        return res.status(500).json({
          success: false,
          message: 'Failed to delete team member'
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Team member not found'
        });
      }

      res.json({
        success: true,
        message: 'Team member deleted successfully'
      });
    }
  );
});


module.exports = router;