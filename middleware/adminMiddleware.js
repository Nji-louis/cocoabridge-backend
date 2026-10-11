const db = require("../config/db");

const verifyAdmin = (req, res, next) => {

    const userId = req.user.id;

    db.query(
        "SELECT * FROM users WHERE id = ?",
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

            const user = results[0];

            if (user.role !== "admin") {
                return res.status(403).json({
                    message: "Admin Access Only"
                });
            }

            next();

        }
    );

};

module.exports = verifyAdmin;