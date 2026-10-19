const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");
const customerRoutes = require("./routes/customers");
const leadRoutes = require("./routes/leads");
const dealRoutes = require("./routes/deals");
const taskRoutes = require("./routes/tasks");
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const aiRoutes = require("./routes/ai");
const app = express();

const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use("/api/leads", leadRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ai", aiRoutes);

app.use("/api/customers", customerRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "SmartCRM Backend is running"
    });
});

app.get("/api/db-test", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            message: "Database connected successfully",
            time: result.rows[0].now
        });
    } catch (error) {
        console.error("Database Error:", error.message);

        res.status(500).json({
            message: "Database connection failed",
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`SmartCRM Backend running on http://localhost:${PORT}`);
});