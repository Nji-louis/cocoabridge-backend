const express = require('express');
const router = express.Router();

const db = require('../config/db');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

/*
|--------------------------------------------------------------------------
| PUBLIC: Submit a comment
|--------------------------------------------------------------------------
*/
router.post('/', async (req, res) => {
    try {
        const { name, email, comment, page } = req.body;

        if (!name || !email || !comment || !page) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, comment and page are required.'
            });
        }

        const cleanName = String(name).trim();
        const cleanEmail = String(email).trim().toLowerCase();
        const cleanComment = String(comment).trim();
        const cleanPage = String(page).trim();

        if (cleanName.length < 2 || cleanName.length > 100) {
            return res.status(400).json({
                success: false,
                message: 'Name must be between 2 and 100 characters.'
            });
        }

        if (cleanComment.length < 3 || cleanComment.length > 5000) {
            return res.status(400).json({
                success: false,
                message: 'Comment must be between 3 and 5000 characters.'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address.'
            });
        }

        const sql = `
            INSERT INTO comments
            (name, email, comment, page, status)
            VALUES (?, ?, ?, ?, 'pending')
        `;

        db.query(
            sql,
            [cleanName, cleanEmail, cleanComment, cleanPage],
            (err, result) => {
                if (err) {
                    console.error('Comment insert error:', err);

                    return res.status(500).json({
                        success: false,
                        message: 'Failed to submit comment.'
                    });
                }

                return res.status(201).json({
                    success: true,
                    message: 'Thank you. Your comment has been submitted for review.',
                    commentId: result.insertId
                });
            }
        );

    } catch (error) {
        console.error('Comment submission error:', error);

        res.status(500).json({
            success: false,
            message: 'Server error while submitting comment.'
        });
    }
});


/*
|--------------------------------------------------------------------------
| PUBLIC: Get approved comments for a page
|--------------------------------------------------------------------------
*/
router.get('/', (req, res) => {
    const page = String(req.query.page || '').trim();

    if (!page) {
        return res.status(400).json({
            success: false,
            message: 'Page is required.'
        });
    }

    const sql = `
        SELECT
            id,
            name,
            comment,
            created_at
        FROM comments
        WHERE page = ?
          AND status = 'approved'
        ORDER BY created_at DESC
    `;

    db.query(sql, [page], (err, results) => {
        if (err) {
            console.error('Get comments error:', err);

            return res.status(500).json({
                success: false,
                message: 'Failed to load comments.'
            });
        }

        res.json({
            success: true,
            comments: results
        });
    });
});


/*
|--------------------------------------------------------------------------
| ADMIN: Get all comments
|--------------------------------------------------------------------------
*/
router.get('/admin/comments', verifyToken, verifyAdmin, (req, res) => {
    const sql = `
        SELECT
            id,
            name,
            email,
            comment,
            page,
            status,
            created_at
        FROM comments
        ORDER BY created_at DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Admin comments error:', err);

            return res.status(500).json({
                success: false,
                message: 'Failed to load comments.'
            });
        }

        res.json({
            success: true,
            comments: results
        });
    });
});


/*
|--------------------------------------------------------------------------
| ADMIN: Change comment status
|--------------------------------------------------------------------------
*/
router.put('/admin/comments/:id/status', verifyToken, verifyAdmin, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['pending', 'approved', 'rejected'];

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid comment status.'
        });
    }

    const sql = `
        UPDATE comments
        SET status = ?
        WHERE id = ?
    `;

    db.query(sql, [status, id], (err, result) => {
        if (err) {
            console.error('Comment status update error:', err);

            return res.status(500).json({
                success: false,
                message: 'Failed to update comment status.'
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found.'
            });
        }

        res.json({
            success: true,
            message: `Comment ${status} successfully.`
        });
    });
});


/*
|--------------------------------------------------------------------------
| ADMIN: Delete comment
|--------------------------------------------------------------------------
*/
router.delete('/admin/comments/:id', verifyToken, verifyAdmin, (req, res) => {
    const { id } = req.params;

    const sql = `
        DELETE FROM comments
        WHERE id = ?
    `;

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Delete comment error:', err);

            return res.status(500).json({
                success: false,
                message: 'Failed to delete comment.'
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found.'
            });
        }

        res.json({
            success: true,
            message: 'Comment deleted successfully.'
        });
    });
});


module.exports = router;
