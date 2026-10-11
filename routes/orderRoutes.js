const express = require("express");
const router = express.Router();

const db = require("../config/db");
const verifyToken = require("../middleware/authMiddleware");

router.get("/admin/all", verifyToken, (req, res) => {

    db.query(
        `
        SELECT
            orders.*,
            users.name,
            users.email
        FROM orders
        LEFT JOIN users
        ON orders.user_id = users.id
        ORDER BY orders.created_at DESC
        `,
        (err, results) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json(results);

        }
    );

});

router.put("/admin/:id/status", verifyToken, (req, res) => {

    const { order_status } = req.body;

    db.query(
        "UPDATE orders SET order_status = ? WHERE id = ?",
        [order_status, req.params.id],
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                success: true,
                message: "Order status updated"
            });

        }
    );

});

// =========================
// TEST ROUTE
// =========================

router.get("/test", (req, res) => {
    res.json({
        success: true,
        message: "Orders route is working"
    });
});


router.get(
  "/admin",
  verifyToken,
  verifyAdmin,
  (req, res) => {

    db.query(
      "SELECT * FROM orders ORDER BY created_at DESC",
      (err, results) => {

        if (err) {
          return res.status(500).json(err);
        }

        res.json(results);

      }
    );

  }
);


// =========================
// CREATE ORDER
// =========================

router.post("/", verifyToken, (req, res) => {

    console.log(req.body);

    const userId = req.user.id;

    const {
        total,
        payment_status,
        order_status
    } = req.body;

    if (!total) {
        return res.status(400).json({
            success: false,
            message: "Total is required"
        });
    }

    const sql =
        "INSERT INTO orders (user_id, total, payment_status, order_status) VALUES (?, ?, ?, ?)";

    db.query(
        sql,
        [
            userId,
            total,
            payment_status || "pending",
            order_status || "pending"
        ],
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                success: true,
                message: "Order Created",
                orderId: result.insertId
            });

        }
    );

});


// =========================
// GET MY ORDERS
// =========================

router.get("/my-orders", verifyToken, (req, res) => {

    console.log("MY ORDERS ROUTE HIT");

    db.query(
        "SELECT * FROM orders WHERE user_id = ?",
        [req.user.id],
        (err, results) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json(results);

        }
    );

});


// =========================
// GET SINGLE ORDER
// =========================

router.get("/:id", verifyToken, (req, res) => {

    db.query(
        "SELECT * FROM orders WHERE id = ?",
        [req.params.id],
        (err, results) => {

            if (err) {
                return res.status(500).json(err);
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: "Order not found"
                });
            }

            res.json(results[0]);

        }
    );

});

module.exports = router;