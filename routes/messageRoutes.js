const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const sendFormEmail = require('../middleware/utils/sendFormEmail');

// PUBLIC CONTACT FORM
router.post('/', (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  const sql = `
    INSERT INTO contact_messages
    (name, email, phone, subject, message, status)
    VALUES (?, ?, ?, ?, ?, 'new')
  `;

  db.query(sql, [name, email, phone, subject, message], async (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    try {
      await sendFormEmail(
        process.env.EMAIL_USER,
        `New Contact Message: ${subject || 'No Subject'}`,
        `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>New Contact Form Message</h2>
            <p><strong>Name:</strong> ${name || ''}</p>
            <p><strong>Email:</strong> ${email || ''}</p>
            <p><strong>Phone:</strong> ${phone || ''}</p>
            <p><strong>Subject:</strong> ${subject || ''}</p>
            <p><strong>Message:</strong></p>
            <p>${message || ''}</p>
          </div>
        `
      );
    } catch (emailError) {
      console.error('Contact notification email error:', emailError);
    }

    res.json({
      success: true,
      message: 'Message sent successfully',
      id: result.insertId
    });
  });
});

// ADMIN - GET ALL MESSAGES
router.get('/admin/messages', verifyToken, verifyAdmin, (req, res) => {
  const sql = 'SELECT * FROM contact_messages ORDER BY created_at DESC';

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
      messages: results
    });
  });
});

// ADMIN - MARK AS READ
router.put('/admin/messages/:id/read', verifyToken, verifyAdmin, (req, res) => {
  const sql = 'UPDATE contact_messages SET status = "read" WHERE id = ?';

  db.query(sql, [req.params.id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    res.json({
      success: true,
      message: 'Message marked as read'
    });
  });
});

// ADMIN - DELETE MESSAGE
router.delete('/admin/messages/:id', verifyToken, verifyAdmin, (req, res) => {
  const sql = 'DELETE FROM contact_messages WHERE id = ?';

  db.query(sql, [req.params.id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  });
});

module.exports = router;




