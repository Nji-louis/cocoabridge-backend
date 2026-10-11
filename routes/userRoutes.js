const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');


// ==========================
// GET USER PROFILE
// ==========================

router.get(
  "/profile",
  verifyToken,
  (req, res) => {

    const userId = req.user.id;

    db.query(
      "SELECT id, name, email, role FROM admins WHERE id = ?",
      [userId],
      (err, results) => {

        if (err) {
          return res.status(500).json(err);
        }

        if (results.length === 0) {
          return res.status(404).json({
            message: "User not found"
          });
        }

        res.json(results[0]);

      }
    );

  }
);



router.get(
  "/admin",
  verifyToken,
  verifyAdmin,
  (req, res) => {

    db.query(
      "SELECT id,name,email,role,created_at FROM admins",
      (err, results) => {

        if (err) {
          return res.status(500).json(err);
        }

        res.json(results);

      }
    );

  }
);

module.exports = router;