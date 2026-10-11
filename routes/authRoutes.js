const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");


const router = express.Router();
const db = require("../config/db");

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(hashedPassword);

  const sql =
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

  db.query(sql, [name, email, hashedPassword], (err, result) => {
    if (err) return res.status(500).json(err);

    res.json({
      message: "User Registered",
    });
  });
});



router.post('/login', async (req, res) => {

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  const sql = 'SELECT * FROM admins WHERE email = ? LIMIT 1';

  db.query(sql, [email], async (err, results) => {

    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    if (!results || results.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const admin = results[0];

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = jwt.sign(
      {
        id: admin.id,
        role: admin.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  });
});



router.post("/forgot-password", (req, res) => {

    const { email } = req.body;

    db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (err, results) => {

            if (err) {
                return res.status(500).json(err);
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            const token = crypto.randomBytes(32).toString("hex");

            const expiry = new Date(
                Date.now() + 60 * 60 * 1000
            );

            db.query(
                "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?",
                [token, expiry, email],
                async (err) => {

                    if (err) {
                        return res.status(500).json(err);
                    }

                    const resetLink =
                        `https://yourfrontend.com/reset-password/${token}`;

                    await sendEmail(
                        "Password Reset Request",
                        `Click this link to reset your password:\n\n${resetLink}`
                    );

                    res.json({
                        success: true,
                        message: "Password reset email sent"
                    });

                }
            );

        }
    );

});

router.post("/reset-password/:token", async (req, res) => {

    const { token } = req.params;
    const { password } = req.body;

    db.query(
        "SELECT * FROM users WHERE reset_token = ?",
        [token],
        async (err, results) => {

            if (err) {
                return res.status(500).json(err);
            }

            if (results.length === 0) {
                return res.status(400).json({
                    message: "Invalid token"
                });
            }

            const user = results[0];

            if (new Date() > new Date(user.reset_token_expiry)) {

                return res.status(400).json({
                    message: "Token expired"
                });

            }

            const hashedPassword =
                await bcrypt.hash(password, 10);

            db.query(
                `
                UPDATE users
                SET password = ?,
                    reset_token = NULL,
                    reset_token_expiry = NULL
                WHERE id = ?
                `,
                [hashedPassword, user.id],
                (err) => {

                    if (err) {
                        return res.status(500).json(err);
                    }

                    res.json({
                        success: true,
                        message: "Password reset successful"
                    });

                }
            );

        }
    );

});

module.exports = router;