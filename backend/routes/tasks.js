const express = require("express");
const router = express.Router();

const pool = require("../config/db");

// GET all tasks
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM tasks ORDER BY id DESC"
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error.message);

        res.status(500).json({
            message: "Failed to fetch tasks"
        });
    }
});

// POST task
router.post("/", async (req, res) => {
    try {
        const { title, description, due_date, status, user_id } = req.body;

        const result = await pool.query(
            `INSERT INTO tasks
            (title, description, due_date, status, user_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                title,
                description,
                due_date || null,
                status || "PENDING",
                user_id || null
            ]
        );

        res.status(201).json({
            message: "Task created successfully",
            task: result.rows[0]
        });

    } catch (error) {
        console.error(error.message);

        res.status(500).json({
            message: "Failed to create task"
        });
    }
});

// UPDATE task
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, due_date, status, user_id } = req.body;

        const result = await pool.query(
            `UPDATE tasks
             SET title = $1,
                 description = $2,
                 due_date = $3,
                 status = $4,
                 user_id = $5
             WHERE id = $6
             RETURNING *`,
            [
                title,
                description,
                due_date || null,
                status,
                user_id || null,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json({
            message: "Task updated successfully",
            task: result.rows[0]
        });

    } catch (error) {
        console.error(error.message);

        res.status(500).json({
            message: "Failed to update task"
        });
    }
});

// DELETE task
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM tasks WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json({
            message: "Task deleted successfully",
            task: result.rows[0]
        });

    } catch (error) {
        console.error(error.message);

        res.status(500).json({
            message: "Failed to delete task"
        });
    }
});

module.exports = router;