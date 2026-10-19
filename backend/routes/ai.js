const express = require("express");
const Groq = require("groq-sdk");
const pool = require("../db");

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// =====================================================
// SMARTCRM AI INSIGHTS
// =====================================================

router.get("/insights", async (req, res) => {
  try {
    const customersResult = await pool.query(`
      SELECT COUNT(*) AS total
      FROM customers
    `);

    const leadsResult = await pool.query(`
      SELECT status, COUNT(*) AS count
      FROM leads
      GROUP BY status
      ORDER BY count DESC
    `);

    const dealsResult = await pool.query(`
      SELECT
        status,
        COUNT(*) AS count,
        COALESCE(SUM(amount), 0) AS total_amount
      FROM deals
      GROUP BY status
      ORDER BY count DESC
    `);

    const tasksResult = await pool.query(`
      SELECT status, COUNT(*) AS count
      FROM tasks
      GROUP BY status
    `);

    const totalCustomers = Number(
      customersResult.rows[0]?.total || 0
    );

    const leadStats = leadsResult.rows;
    const dealStats = dealsResult.rows;
    const taskStats = tasksResult.rows;

    const totalLeads = leadStats.reduce(
      (sum, item) => sum + Number(item.count),
      0
    );

    const qualifiedLeads = leadStats
      .filter(
        (item) =>
          String(item.status).toUpperCase() === "QUALIFIED"
      )
      .reduce(
        (sum, item) => sum + Number(item.count),
        0
      );

    const openDeals = dealStats
      .filter(
        (item) =>
          String(item.status).toUpperCase() === "OPEN"
      )
      .reduce(
        (sum, item) => sum + Number(item.count),
        0
      );

    const wonRevenue = dealStats
      .filter(
        (item) =>
          String(item.status).toUpperCase() === "WON"
      )
      .reduce(
        (sum, item) => sum + Number(item.total_amount),
        0
      );

    const pendingTasks = taskStats
      .filter(
        (item) =>
          String(item.status).toUpperCase() === "PENDING"
      )
      .reduce(
        (sum, item) => sum + Number(item.count),
        0
      );

    const insights = [];

    if (totalCustomers > 0) {
      insights.push({
        type: "success",
        title: "Customer Base",
        message: `SmartCRM currently has ${totalCustomers} customer${
          totalCustomers === 1 ? "" : "s"
        } in the system.`,
      });
    } else {
      insights.push({
        type: "warning",
        title: "No Customers",
        message:
          "No customers have been added yet. Start building your customer database.",
      });
    }

    if (qualifiedLeads > 0) {
      insights.push({
        type: "info",
        title: "Qualified Leads",
        message: `${qualifiedLeads} qualified lead${
          qualifiedLeads === 1 ? "" : "s"
        } ${
          qualifiedLeads === 1 ? "is" : "are"
        } ready for potential deal conversion.`,
      });
    } else if (totalLeads > 0) {
      insights.push({
        type: "warning",
        title: "Lead Opportunity",
        message:
          "There are leads in the CRM, but no qualified leads are currently available.",
      });
    }

    if (openDeals > 0) {
      insights.push({
        type: "info",
        title: "Sales Pipeline",
        message: `${openDeals} open deal${
          openDeals === 1 ? "" : "s"
        } ${
          openDeals === 1 ? "is" : "are"
        } currently in the sales pipeline.`,
      });
    }

    if (wonRevenue > 0) {
      insights.push({
        type: "success",
        title: "Won Revenue",
        message: `Your current won revenue is ₹${wonRevenue.toLocaleString(
          "en-IN"
        )}.`,
      });
    }

    if (pendingTasks > 0) {
      insights.push({
        type: "warning",
        title: "Pending Tasks",
        message: `${pendingTasks} pending task${
          pendingTasks === 1 ? "" : "s"
        } ${
          pendingTasks === 1 ? "needs" : "need"
        } attention.`,
      });
    } else {
      insights.push({
        type: "success",
        title: "Task Management",
        message: "There are currently no pending tasks.",
      });
    }

    res.json({
      success: true,
      title: "SmartCRM Insights",
      insights,
    });
  } catch (error) {
    console.error("INSIGHTS ERROR:", error);

    res.status(500).json({
      success: false,
      error: "Unable to generate SmartCRM insights",
      details: error.message,
    });
  }
});

// =====================================================
// SMARTCRM AI CHAT
// =====================================================

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      });
    }

    // -----------------------------
    // FETCH CRM DATA
    // -----------------------------

    const customersResult = await pool.query(`
      SELECT
        id,
        name,
        email,
        phone,
        company,
        status
      FROM customers
      ORDER BY id DESC
    `);

    const leadsResult = await pool.query(`
      SELECT
        id,
        name,
        email,
        phone,
        source,
        status
      FROM leads
      ORDER BY id DESC
    `);

    const dealsResult = await pool.query(`
      SELECT
        d.id,
        d.title,
        d.amount,
        d.status,
        c.name AS customer_name
      FROM deals d
      LEFT JOIN customers c
        ON d.customer_id = c.id
      ORDER BY d.id DESC
    `);

    const tasksResult = await pool.query(`
      SELECT
        id,
        title,
        description,
        due_date,
        status
      FROM tasks
      ORDER BY id DESC
    `);

    const crmData = {
      customers: customersResult.rows,
      leads: leadsResult.rows,
      deals: dealsResult.rows,
      tasks: tasksResult.rows,
    };

    // -----------------------------
    // GROQ MODEL
    // -----------------------------

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",

      temperature: 0.3,

      messages: [
        {
          role: "system",
          content: `
You are SmartCRM AI, an intelligent CRM assistant.

Your job is to analyze the CRM data provided by the application
and answer the user's question accurately.

IMPORTANT RULES:

1. Use the CRM data when answering CRM-related questions.
2. Never invent customers, leads, deals or tasks.
3. If requested information is not present in the CRM data,
   clearly say that the information is not available.
4. Give concise but useful answers.
5. Identify important leads, deal opportunities,
   pending tasks and possible sales risks.
6. Use simple and professional language.
7. Use bullet points when useful.
8. All monetary amounts are in INR.
9. If the user asks for a summary,
   provide a short and easy-to-understand summary.
10. If the user asks about a specific customer,
    lead, deal or task, use the actual CRM data.
11. Do not claim that you performed an action
    if you only analyzed the data.
12. Do not modify CRM data.
13. Do not invent CRM information.

CURRENT SMARTCRM DATA:

${JSON.stringify(crmData, null, 2)}
          `,
        },

        {
          role: "user",
          content: message,
        },
      ],
    });

    const answer =
      completion.choices?.[0]?.message?.content ||
      "I could not generate an answer.";

    res.json({
      success: true,
      answer,
    });
  } catch (error) {
    console.error("GROQ AI ERROR:", error);

    res.status(500).json({
      success: false,
      error: "AI service failed",
      details: error.message,
    });
  }
});

module.exports = router;