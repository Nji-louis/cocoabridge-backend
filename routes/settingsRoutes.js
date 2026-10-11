const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Public settings
router.get('/public', (req, res) => {
  db.query(
    `SELECT company_name, email, phone, address, website, logo_url,
       facebook_url, linkedin_url, instagram_url, whatsapp_url, twitter_url
FROM settings
     WHERE id = 1
     LIMIT 1`,
    (err, results) => {
      if (err) {
        console.error('Public settings error:', err);

        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      res.json({
        success: true,
        settings: results[0] || {}
      });
    }
  );
});

const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Get settings
router.get('/', verifyToken, verifyAdmin, (req, res) => {
  db.query('SELECT * FROM settings WHERE id = 1 LIMIT 1', (err, results) => {
    if (err) {
      return res.status(500).json({ success:false, message:'Database error' });
    }

    res.json({
      success:true,
      settings: results[0] || {}
    });
  });
});

// Update settings
router.put('/', verifyToken, verifyAdmin, (req, res) => {
  const {
  company_name,
  email,
  phone,
  address,
  website,
  logo_url,
  facebook_url,
  linkedin_url,
  instagram_url,
  whatsapp_url,
  twitter_url
} = req.body;

  const sql = `
    UPDATE settings
    SET company_name=?,
    email=?,
    phone=?,
    address=?,
    website=?,
    logo_url=?,
    facebook_url=?,
    linkedin_url=?,
    instagram_url=?,
    whatsapp_url=?,
    twitter_url=?
    WHERE id=1
  `;

  db.query(sql,
    [
  company_name,
  email,
  phone,
  address,
  website,
  logo_url,
  facebook_url,
  linkedin_url,
  instagram_url,
  whatsapp_url,
  twitter_url
],
    (err) => {
      if (err) {
        return res.status(500).json({ success:false, message:'Database error' });
      }

      res.json({
        success:true,
        message:'Settings updated successfully'
      });
    }
  );
});

module.exports = router;