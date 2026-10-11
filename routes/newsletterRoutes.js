const express = require('express');
const router = express.Router();
const db = require('../config/db');
const sendNewsletterEmail = require('../middleware/utils/sendNewsletterEmail');

const {
  verifyToken,
  verifyAdminOrEditor
} = require('../middleware/authMiddleware');

// PUBLIC - NEWSLETTER SUBSCRIPTION
router.post('/subscribe', (req, res) => {
  const { email, full_name, fullName, name, source, preferences } = req.body;

const subscriberName =
  full_name ||
  fullName ||
  name ||
  (preferences && (preferences.fullName || preferences.full_name || preferences.name)) ||
  null;

const subscriberSource =
  source ||
  (preferences && (preferences.sourceChannel || preferences.source)) ||
  null;

  const normalizedEmail = String(email || '').trim().toLowerCase();



  // Basic email validation
  if (!normalizedEmail) {
    return res.status(400).json({
      success: false,
      message: 'Email address is required'
    });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(normalizedEmail)) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid email address'
    });
  }

  // Check whether this email already exists
  const checkSql = `
    SELECT id, status
    FROM newsletter_subscribers
    WHERE email = ?
    LIMIT 1
  `;

  db.query(checkSql, [normalizedEmail], (checkErr, rows) => {
    if (checkErr) {
      console.error('Newsletter subscription lookup error:', checkErr);

      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    // Existing subscriber
    if (rows.length > 0) {
      const subscriber = rows[0];

      // Reactivate an unsubscribed email
      if (subscriber.status === 'unsubscribed') {
        const updateSql = `
          UPDATE newsletter_subscribers
          SET
            full_name = COALESCE(?, full_name),
            status = 'active',
            source = COALESCE(?, source)
          WHERE id = ?
        `;

        return db.query(
          updateSql,
          [subscriberName, subscriberSource, subscriber.id],
          (updateErr) => {
            if (updateErr) {
              console.error('Newsletter reactivation error:', updateErr);

              return res.status(500).json({
                success: false,
                message: 'Database error'
              });
            }

            return res.json({
              success: true,
              message: 'You have been subscribed successfully'
            });
          }
        );
      }

      // Already active
      return res.json({
        success: true,
        message: 'You are already subscribed to our newsletter'
      });
    }

    // New subscriber
    const insertSql = `
      INSERT INTO newsletter_subscribers
      (full_name, email, status, source)
      VALUES (?, ?, 'active', ?)
    `;

    db.query(
      insertSql,
      [subscriberName, normalizedEmail, subscriberSource],
      (insertErr, result) => {
        if (insertErr) {
          console.error('Newsletter subscription insert error:', insertErr);

          return res.status(500).json({
            success: false,
            message: 'Database error'
          });
        }

        return res.json({
          success: true,
          message: 'You have been subscribed successfully',
          id: result.insertId
        });
      }
    );
  });
});


// ADMIN - GET ALL NEWSLETTER SUBSCRIBERS
// GET /api/forms/admin/subscribers
router.get(
  '/admin/subscribers',
  verifyToken,
  verifyAdminOrEditor,
  (req, res) => {

    const sql = `
      SELECT
        id,
        full_name,
        email,
        status,
        source,
        subscribed_at,
        updated_at
      FROM newsletter_subscribers
      ORDER BY subscribed_at DESC
    `;

    db.query(sql, (err, results) => {

      if (err) {
        console.error('Newsletter subscribers GET error:', err);

        return res.status(500).json({
          success: false,
          message: 'Failed to load subscribers'
        });
      }

      res.json({
        success: true,
        subscribers: results
      });
    });
  }
);


// ADMIN - UPDATE SUBSCRIBER STATUS
// PUT /api/forms/admin/subscribers/:id/status
router.put(
  '/admin/subscribers/:id/status',
  verifyToken,
  verifyAdminOrEditor,
  (req, res) => {

    const { status } = req.body;
    const subscriberId = Number(req.params.id);

    if (!Number.isInteger(subscriberId) || subscriberId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscriber ID'
      });
    }

    if (!['active', 'unsubscribed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscriber status'
      });
    }

    const sql = `
      UPDATE newsletter_subscribers
      SET status = ?
      WHERE id = ?
    `;

    db.query(sql, [status, subscriberId], (err, result) => {

      if (err) {
        console.error('Newsletter status update error:', err);

        return res.status(500).json({
          success: false,
          message: 'Failed to update subscriber status'
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Subscriber not found'
        });
      }

      res.json({
        success: true,
        message: status === 'active'
          ? 'Subscriber approved successfully'
          : 'Subscriber disapproved successfully'
      });
    });
  }
);



// ADMIN - SEND NEWSLETTER
// POST /api/forms/admin/newsletter/send
router.post(
  '/admin/newsletter/send',
  verifyToken,
  verifyAdminOrEditor,
  async (req, res) => {

    const { subject, message } = req.body;

    if (!subject || !subject.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Newsletter subject is required'
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Newsletter message is required'
      });
    }

    const sql = `
      SELECT email
      FROM newsletter_subscribers
      WHERE status = 'active'
      ORDER BY id ASC
    `;

    db.query(sql, async (err, subscribers) => {

      if (err) {
        console.error('Newsletter subscribers email lookup error:', err);

        return res.status(500).json({
          success: false,
          message: 'Failed to load active subscribers'
        });
      }

      if (!subscribers.length) {
        return res.status(400).json({
          success: false,
          message: 'There are no active subscribers to email'
        });
      }

      try {
        const sendNewsletterEmail = require('../middleware/utils/sendNewsletterEmail');

        let sentCount = 0;
        let failedCount = 0;

        for (const subscriber of subscribers) {
          try {
            await sendNewsletterEmail(
              subscriber.email,
              subject.trim(),
              `<div style="font-family: Arial, sans-serif; line-height: 1.6;">
                ${message.trim().replace(/\n/g, '<br>')}
              </div>`
            );

            sentCount++;
          } catch (emailError) {
            failedCount++;

            console.error(
              `Newsletter email failed for ${subscriber.email}:`,
              emailError
            );
          }
        }

        return res.json({
          success: true,
          message: 'Newsletter sending completed',
          totalSubscribers: subscribers.length,
          sentCount,
          failedCount
        });

      } catch (error) {
        console.error('Newsletter sending error:', error);

        return res.status(500).json({
          success: false,
          message: 'Failed to send newsletter'
        });
      }
    });
  }
);

module.exports = router;