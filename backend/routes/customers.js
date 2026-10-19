const express = require("express");
const router = express.Router();

const pool = require("../config/db");

// GET all customers
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM customers ORDER BY id DESC"
        );

        res.json(result.rows);
    } catch (error) {
        console.error("Get Customers Error:", error.message);

        res.status(500).json({
            message: "Failed to fetch customers"
        });
    }
});

// POST new customer
router.post("/", async (req, res) => {
    try {
        const { name, email, phone, company, status } = req.body;

        const result = await pool.query(
            `INSERT INTO customers
            (name, email, phone, company, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                name,
                email,
                phone,
                company,
                status || "ACTIVE"
            ]
        );

        res.status(201).json({
            message: "Customer created successfully",
            customer: result.rows[0]
        });

    } catch (error) {
        console.error("Create Customer Error:", error.message);

        res.status(500).json({
            message: "Failed to create customer"
        });
    }
});
// UPDATE customer
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, company, status } = req.body;

        const result = await pool.query(
            `UPDATE customers
             SET name = $1,
                 email = $2,
                 phone = $3,
                 company = $4,
                 status = $5
             WHERE id = $6
             RETURNING *`,
            [name, email, phone, company, status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        res.json({
            message: "Customer updated successfully",
            customer: result.rows[0]
        });

    } catch (error) {
        console.error("Update Customer Error:", error.message);

        res.status(500).json({
            message: "Failed to update customer"
        });
    }
});
// DELETE customer
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM customers WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        res.json({
            message: "Customer deleted successfully",
            customer: result.rows[0]
        });

    } catch (error) {
        console.error("Delete Customer Error:", error.message);

        res.status(500).json({
            message: "Failed to delete customer"
        });
    }
});

module.exports = router;