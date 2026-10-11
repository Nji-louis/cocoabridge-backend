const express = require('express');
const router = express.Router();

const db = require('../config/db');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// =====================================================
// PUBLIC - GET ACTIVE TESTIMONIALS
// =====================================================

router.get('/', (req, res) => {

    const sql = `
        SELECT
            id,
            client_name,
            company_name,
            country,
            testimonial,
            rating,
            featured,
            status,
            created_at
        FROM testimonials
        WHERE status = 'active'
        ORDER BY created_at DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error('Testimonials Error:', err);

            return res.status(500).json({
                success: false,
                message: 'Failed to load testimonials'
            });
        }

        res.json({
            success: true,
            testimonials: results
        });

    });

});


// =====================================================
// ADMIN - GET ALL TESTIMONIALS
// GET /api/testimonials/admin/all
// =====================================================

router.get('/admin/all', verifyToken, verifyAdmin, (req, res) => {

    const sql = `
        SELECT
            id,
            client_name,
            company_name,
            country,
            testimonial,
            rating,
            featured,
            status,
            created_at
        FROM testimonials
        ORDER BY created_at DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error('Admin Testimonials Error:', err);

            return res.status(500).json({
                success: false,
                message: 'Failed to load testimonials'
            });
        }

        res.json({
            success: true,
            testimonials: results
        });

    });

});


// =====================================================
// ADMIN - CREATE TESTIMONIAL
// POST /api/testimonials/admin
// =====================================================

router.post('/admin', verifyToken, verifyAdmin, (req, res) => {

    const {
        client_name,
        company_name,
        country,
        testimonial,
        rating,
        featured,
        status
    } = req.body;

    if (!client_name || !testimonial) {

        return res.status(400).json({
            success: false,
            message: 'Client name and testimonial are required'
        });

    }

    const sql = `
        INSERT INTO testimonials
        (
            client_name,
            company_name,
            country,
            testimonial,
            rating,
            featured,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        client_name,
        company_name || null,
        country || null,
        testimonial,
        rating || 5,
        featured ? 1 : 0,
        status || 'active'
    ];

    db.query(sql, values, (err, result) => {

        if (err) {
            console.error('Create Testimonial Error:', err);

            return res.status(500).json({
                success: false,
                message: 'Failed to create testimonial'
            });
        }

        res.status(201).json({
            success: true,
            message: 'Testimonial created successfully',
            id: result.insertId
        });

    });

});


// =====================================================
// ADMIN - UPDATE TESTIMONIAL
// PUT /api/testimonials/admin/:id
// =====================================================

router.put('/admin/:id', verifyToken, verifyAdmin, (req, res) => {

    const { id } = req.params;

    const {
        client_name,
        company_name,
        country,
        testimonial,
        rating,
        featured,
        status
    } = req.body;

    if (!client_name || !testimonial) {

        return res.status(400).json({
            success: false,
            message: 'Client name and testimonial are required'
        });

    }

    const sql = `
        UPDATE testimonials
        SET
            client_name = ?,
            company_name = ?,
            country = ?,
            testimonial = ?,
            rating = ?,
            featured = ?,
            status = ?
        WHERE id = ?
    `;

    const values = [
        client_name,
        company_name || null,
        country || null,
        testimonial,
        rating || 5,
        featured ? 1 : 0,
        status || 'active',
        id
    ];

    db.query(sql, values, (err, result) => {

        if (err) {
            console.error('Update Testimonial Error:', err);

            return res.status(500).json({
                success: false,
                message: 'Failed to update testimonial'
            });
        }

        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: 'Testimonial not found'
            });

        }

        res.json({
            success: true,
            message: 'Testimonial updated successfully'
        });

    });

});


// =====================================================
// ADMIN - DELETE TESTIMONIAL
// DELETE /api/testimonials/admin/:id
// =====================================================

router.delete('/admin/:id', verifyToken, verifyAdmin, (req, res) => {

    const { id } = req.params;

    const sql = `
        DELETE FROM testimonials
        WHERE id = ?
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.error('Delete Testimonial Error:', err);

            return res.status(500).json({
                success: false,
                message: 'Failed to delete testimonial'
            });
        }

        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: 'Testimonial not found'
            });

        }

        res.json({
            success: true,
            message: 'Testimonial deleted successfully'
        });

    });

});


module.exports = router;