const express = require("express");
const router = express.Router();

const pool = require("../config/db");

// GET all deals
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT deals.*, customers.name AS customer_name
            FROM deals
            LEFT JOIN customers ON deals.customer_id = customers.id
            ORDER BY deals.id DESC
        `);

        res.json(result.rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: "Failed to fetch deals"
        });
    }
});

// POST deal
router.post("/", async (req, res) => {
    try {
        const { title, customer_id, amount, status } = req.body;

        const result = await pool.query(
            `INSERT INTO deals
            (title, customer_id, amount, status)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [title, customer_id || null, amount || 0, status || "OPEN"]
        );

        res.status(201).json({
            message: "Deal created successfully",
            deal: result.rows[0]
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: "Failed to create deal"
        });
    }
});

// UPDATE deal
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title, customer_id, amount, status } = req.body;

        const result = await pool.query(
            `UPDATE deals
             SET title = $1,
                 customer_id = $2,
                 amount = $3,
                 status = $4
             WHERE id = $5
             RETURNING *`,
            [title, customer_id || null, amount || 0, status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Deal not found"
            });
        }

        res.json({
            message: "Deal updated successfully",
            deal: result.rows[0]
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: "Failed to update deal"
        });
    }
});

// DELETE deal
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM deals WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Deal not found"
            });
        }

        res.json({
            message: "Deal deleted successfully",
            deal: result.rows[0]
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: "Failed to delete deal"
        });
    }
});

module.exports = router;