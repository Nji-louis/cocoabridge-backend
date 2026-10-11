const express = require('express');
const router = express.Router();
const db = require('../config/db');
const sendFormEmail = require('../middleware/utils/sendFormEmail');

// POST /api/quotes
router.post('/', (req, res) => {
  const {
    company_name,
    contact_name,
    email,
    phone,
    country,
    product,
    quantity,
    packaging,
    destination_port,
    message
  } = req.body;

  if (!contact_name || !email || !product || !quantity) {
    return res.status(400).json({
      success: false,
      message: 'Contact name, email, product and quantity are required'
    });
  }

  const sql = `
    INSERT INTO quote_requests
    (company_name, contact_name, email, phone, country,
     product, quantity, packaging, destination_port, message)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      company_name || '',
      contact_name,
      email,
      phone || '',
      country || '',
      product,
      quantity,
      packaging || '',
      destination_port || '',
      message || ''
    ],
    async (err, result) => {
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
          'New Request for Quote',
          `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
              <h2>New Request for Quote</h2>
              <p><strong>Company:</strong> ${company_name || ''}</p>
              <p><strong>Contact Name:</strong> ${contact_name || ''}</p>
              <p><strong>Email:</strong> ${email || ''}</p>
              <p><strong>Phone:</strong> ${phone || ''}</p>
              <p><strong>Country:</strong> ${country || ''}</p>
              <p><strong>Product:</strong> ${product || ''}</p>
              <p><strong>Quantity:</strong> ${quantity || ''}</p>
              <p><strong>Packaging:</strong> ${packaging || ''}</p>
              <p><strong>Destination Port:</strong> ${destination_port || ''}</p>
              <p><strong>Message:</strong></p>
              <p>${message || ''}</p>
            </div>
          `
        );
      } catch (emailError) {
        console.error('Quote notification email error:', emailError);
      }

      res.status(201).json({
        success: true,
        message: 'Quote request submitted successfully',
        id: result.insertId
      });
    }
  );
});

const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Get all quote requests
router.get('/admin/quotes', verifyToken, verifyAdmin, (req, res) => {
  db.query('SELECT * FROM quote_requests ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ success:false, message:'Database error' });

    res.json({ success:true, quotes:results });
  });
});

// Mark quote as processed
router.put('/admin/quotes/:id/processed', verifyToken, verifyAdmin, (req, res) => {
  db.query(
    'UPDATE quote_requests SET status = "processed" WHERE id = ?',
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ success:false, message:'Database error' });

      res.json({ success:true, message:'Quote marked as processed' });
    }
  );
});

// Delete quote
router.delete('/admin/quotes/:id', verifyToken, verifyAdmin, (req, res) => {
  db.query('DELETE FROM quote_requests WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ success:false, message:'Database error' });

    res.json({ success:true, message:'Quote deleted successfully' });
  });
});

module.exports = router;