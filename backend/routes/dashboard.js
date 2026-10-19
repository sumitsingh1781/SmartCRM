const express = require("express");
const router = express.Router();

const pool = require("../config/db");

// Dashboard statistics
router.get("/", async (req, res) => {
    try {
        const customers = await pool.query(
            "SELECT COUNT(*) AS total FROM customers"
        );

        const leads = await pool.query(
            "SELECT COUNT(*) AS total FROM leads"
        );

        const deals = await pool.query(
            "SELECT COUNT(*) AS total FROM deals"
        );

        const revenue = await pool.query(
            "SELECT COALESCE(SUM(amount), 0) AS total FROM deals WHERE status = 'WON'"
        );

        const pendingTasks = await pool.query(
            "SELECT COUNT(*) AS total FROM tasks WHERE status = 'PENDING'"
        );

        res.json({
            customers: Number(customers.rows[0].total),
            leads: Number(leads.rows[0].total),
            deals: Number(deals.rows[0].total),
            revenue: Number(revenue.rows[0].total),
            pendingTasks: Number(pendingTasks.rows[0].total)
        });

    } catch (error) {
        console.error("Dashboard Error:", error.message);

        res.status(500).json({
            message: "Failed to load dashboard"
        });
    }
});

module.exports = router;