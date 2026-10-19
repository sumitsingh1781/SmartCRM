const express = require("express");
const router = express.Router();

const pool = require("../config/db");

// GET all leads
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM leads ORDER BY id DESC"
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Failed to fetch leads" });
    }
});

// POST lead
router.post("/", async (req, res) => {
    try {
        const { name, email, phone, source, status } = req.body;

        const result = await pool.query(
            `INSERT INTO leads
            (name, email, phone, source, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [name, email, phone, source, status || "NEW"]
        );

        res.status(201).json({
            message: "Lead created successfully",
            lead: result.rows[0]
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Failed to create lead" });
    }
});

// UPDATE lead
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, source, status } = req.body;

        const result = await pool.query(
            `UPDATE leads
             SET name = $1,
                 email = $2,
                 phone = $3,
                 source = $4,
                 status = $5
             WHERE id = $6
             RETURNING *`,
            [name, email, phone, source, status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Lead not found"
            });
        }

        res.json({
            message: "Lead updated successfully",
            lead: result.rows[0]
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Failed to update lead" });
    }
});

// DELETE lead
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM leads WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Lead not found"
            });
        }

        res.json({
            message: "Lead deleted successfully",
            lead: result.rows[0]
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Failed to delete lead" });
    }
});

module.exports = router;