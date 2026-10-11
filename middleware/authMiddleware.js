
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Verify JWT token and confirm account is active
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  const token = authHeader.split(' ')[1];

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  db.query(
    'SELECT id, name, email, role, is_active FROM admins WHERE id = ? LIMIT 1',
    [decoded.id],
    (err, rows) => {
      if (err) {
        console.error('Account verification error:', err);
        return res.status(500).json({
          success: false,
          message: 'Account verification failed'
        });
      }

      if (!rows.length || Number(rows[0].is_active) !== 1) {
        return res.status(403).json({
          success: false,
          message: 'This account is inactive or no longer exists.'
        });
      }

      req.user = {
        ...decoded,
        id: rows[0].id,
        name: rows[0].name,
        email: rows[0].email,
        role: rows[0].role
      };

      next();
    }
  );
};

// Verify admin role
const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  next();
};

// Verify admin or editor role
const verifyAdminOrEditor = (req, res, next) => {
  if (!req.user || !['admin', 'editor'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Admin or editor access required'
    });
  }

  next();
};

module.exports = {
  verifyToken,
  verifyAdmin,
  verifyAdminOrEditor
};
