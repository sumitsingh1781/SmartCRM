
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type RecordItem = Record<string, unknown>;

const API_BASE =
  "https://smartcrm-backend-cm0u.onrender.com/api";

function getArray(
  data: unknown,
  keys: string[] = []
): RecordItem[] {
  if (Array.isArray(data)) return data as RecordItem[];

  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;

    for (const key of keys) {
      if (Array.isArray(obj[key])) {
        return obj[key] as RecordItem[];
      }
    }

    if (Array.isArray(obj.data)) {
      return obj.data as RecordItem[];
    }
  }

  return [];
}

function getText(
  value: unknown,
  fallback = "Unknown"
): string {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
}

function getAmount(item: RecordItem): number {
  const value = Number(
    item.amount ??
      item.value ??
      item.revenue ??
      item.deal_value ??
      0
  );

  return Number.isFinite(value) ? value : 0;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function normalizeStatus(value: unknown): string {
  return getText(value)
    .trim()
    .toUpperCase()
    .replaceAll("_", " ");
}

function getDate(item: RecordItem): Date | null {
  const value =
    item.created_at ??
    item.createdAt ??
    item.date;

  if (!value) return null;

  const date = new Date(String(value));

  return Number.isNaN(date.getTime()) ? null : date;
}

function downloadCSV(
  filename: string,
  rows: Record<string, unknown>[]
) {
  if (!rows.length) {
    alert("Export karne ke liye data available nahi hai.");
    return;
  }

  const headers = Array.from(
    new Set(rows.flatMap((row) => Object.keys(row)))
  );

  const escapeCSV = (value: unknown) =>
    `"${String(value ?? "").replaceAll('"', '""')}"`;

  const csv = [
    headers.map(escapeCSV).join(","),
    ...rows.map((row) =>
      headers.map((header) => escapeCSV(row[header])).join(",")
    ),
  ].join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

const WON_STATUSES = [
  "WON",
  "CLOSED WON",
  "COMPLETED",
  "SUCCESS",
];

const LOST_STATUSES = [
  "LOST",
  "CLOSED LOST",
  "CANCELLED",
  "CANCELED",
];

export default function ReportsPage() {
  const [customers, setCustomers] = useState<RecordItem[]>([]);
  const [leads, setLeads] = useState<RecordItem[]>([]);
  const [deals, setDeals] = useState<RecordItem[]>([]);
  const [tasks, setTasks] = useState<RecordItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("all");

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const endpoints = [
        { key: "customers", url: `${API_BASE}/customers` },
        { key: "leads", url: `${API_BASE}/leads` },
        { key: "deals", url: `${API_BASE}/deals` },
        { key: "tasks", url: `${API_BASE}/tasks` },
      ];

      const responses = await Promise.all(
        endpoints.map(async ({ key, url }) => {
          let response: Response;

          try {
            response = await fetch(url, {
              cache: "no-store",
            });
          } catch (cause) {
            console.error(`Network error for ${key}:`, cause);

            throw new Error(
              `${key} API tak connection nahi ho paya. URL: ${url}. Network ya CORS check karo.`
            );
          }

          if (!response.ok) {
            const details = await response.text().catch(() => "");

            console.error(`${key} API error:`, {
              status: response.status,
              url,
              details,
            });

            throw new Error(
              `${key} API failed: HTTP ${response.status}. ${details.slice(0, 180)}`
            );
          }

          try {
            return await response.json();
          } catch {
            throw new Error(
              `${key} API ne valid JSON response nahi diya.`
            );
          }
        })
      );

      setCustomers(getArray(responses[0], ["customers"]));
      setLeads(getArray(responses[1], ["leads"]));
      setDeals(getArray(responses[2], ["deals"]));
      setTasks(getArray(responses[3], ["tasks"]));
    } catch (cause) {
      console.error("Reports loading error:", cause);

      setError(
        cause instanceof Error
          ? cause.message
          : "Reports ka data load nahi ho paaya."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const filtered = useMemo(() => {
    if (period === "all") {
      return { customers, leads, deals, tasks };
    }

    const days = Number(period);
    const cutoff = new Date();

    cutoff.setDate(cutoff.getDate() - days);

    const isRecent = (item: RecordItem) => {
      const date = getDate(item);
      return date !== null && date >= cutoff;
    };

    return {
      customers: customers.filter(isRecent),
      leads: leads.filter(isRecent),
      deals: deals.filter(isRecent),
      tasks: tasks.filter(isRecent),
    };
  }, [customers, leads, deals, tasks, period]);

  const wonDeals = filtered.deals.filter((deal) =>
    WON_STATUSES.includes(normalizeStatus(deal.status))
  );

  const lostDeals = filtered.deals.filter((deal) =>
    LOST_STATUSES.includes(normalizeStatus(deal.status))
  );

  const pipelineDeals = filtered.deals.filter((deal) => {
    const status = normalizeStatus(deal.status);

    return (
      !WON_STATUSES.includes(status) &&
      !LOST_STATUSES.includes(status)
    );
  });

  const revenue = wonDeals.reduce(
    (sum, deal) => sum + getAmount(deal),
    0
  );

  const leadStatusCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    filtered.leads.forEach((lead) => {
      const status = normalizeStatus(lead.status);
      counts[status] = (counts[status] || 0) + 1;
    });

    return Object.entries(counts).sort(
      (a, b) => b[1] - a[1]
    );
  }, [filtered.leads]);

  const dealStatusCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    filtered.deals.forEach((deal) => {
      const status = normalizeStatus(deal.status);
      counts[status] = (counts[status] || 0) + 1;
    });

    return Object.entries(counts).sort(
      (a, b) => b[1] - a[1]
    );
  }, [filtered.deals]);

  const completedTasks = filtered.tasks.filter((task) =>
    ["COMPLETED", "DONE", "CLOSED"].includes(
      normalizeStatus(task.status)
    )
  ).length;

  const conversionRate = filtered.leads.length
    ? (wonDeals.length / filtered.leads.length) * 100
    : 0;

  const recentDeals = [...filtered.deals]
    .sort((a, b) => {
      const dateA = getDate(a)?.getTime() ?? 0;
      const dateB = getDate(b)?.getTime() ?? 0;

      return dateB - dateA;
    })
    .slice(0, 5);

  const exportReport = () => {
    const rows = [
      ...filtered.customers.map((item) => ({
        Type: "Customer",
        Name: getText(item.name ?? item.company),
        Status: getText(item.status),
        Amount: "",
        Created: getText(
          item.created_at ?? item.createdAt,
          ""
        ),
      })),
      ...filtered.leads.map((item) => ({
        Type: "Lead",
        Name: getText(item.name ?? item.company),
        Status: getText(item.status),
        Amount: "",
        Created: getText(
          item.created_at ?? item.createdAt,
          ""
        ),
      })),
      ...filtered.deals.map((item) => ({
        Type: "Deal",
        Name: getText(item.title ?? item.name),
        Status: getText(item.status),
        Amount: getAmount(item),
        Created: getText(
          item.created_at ?? item.createdAt,
          ""
        ),
      })),
      ...filtered.tasks.map((item) => ({
        Type: "Task",
        Name: getText(item.title ?? item.description),
        Status: getText(item.status),
        Amount: "",
        Created: getText(
          item.created_at ?? item.createdAt,
          ""
        ),
      })),
    ];

    downloadCSV("smartcrm-report.csv", rows);
  };

  const maxLeadCount = Math.max(
    1,
    ...leadStatusCounts.map(([, count]) => count)
  );

  const maxDealCount = Math.max(
    1,
    ...dealStatusCounts.map(([, count]) => count)
  );

  return (
    <main className="reports-page">
      <style jsx>{`
        .reports-page {
          min-height: 100vh;
          padding: 34px;
          color: #edf1ff;
          background: #0b1020;
          font-family: Arial, Helvetica, sans-serif;
        }

        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }

        .eyebrow {
          color: #9c8cff;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        h1 {
          font-size: clamp(27px, 3vw, 34px);
          font-weight: 750;
          letter-spacing: -1px;
          margin: 0 0 9px;
        }

        .subtitle {
          color: #929db7;
          font-size: 14px;
          line-height: 1.6;
          margin: 0;
        }

        .actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        button, select {
          font: inherit;
          font-size: 13px;
          border-radius: 10px;
          padding: 12px 15px;
          border: 1px solid #29334d;
          background: #131b30;
          color: #eaf0ff;
          cursor: pointer;
        }

        button:hover {
          border-color: #8072ff;
          transform: translateY(-1px);
        }

        button:disabled {
          opacity: 0.5;
          cursor: wait;
        }

        .primary {
          background: linear-gradient(135deg, #7164f7, #5947d9);
          border-color: transparent;
          font-weight: 700;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 17px;
          margin-bottom: 22px;
        }

        .panel {
          min-width: 0;
          padding: 22px;
          border: 1px solid #202b43;
          border-radius: 17px;
          background: linear-gradient(145deg, #141d32, #101729);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .stat-top, .panel-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .stat-label {
          color: #a3aec7;
          font-size: 13px;
        }

        .stat-icon {
          width: 39px;
          height: 39px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background: #25244c;
          color: #aaa0ff;
          font-size: 18px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 750;
          letter-spacing: -0.8px;
          margin-top: 17px;
          overflow-wrap: anywhere;
        }

        .stat-note {
          color: #8390ad;
          font-size: 12px;
          margin-top: 8px;
        }

        .content-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 20px;
          margin-bottom: 20px;
        }

        .panel-heading {
          margin-bottom: 22px;
        }

        h2 {
          font-size: 16px;
          font-weight: 700;
          margin: 0 0 6px;
        }

        .panel-subtitle {
          font-size: 12px;
          color: #8491ad;
          margin: 0;
        }

        .count-pill {
          font-size: 11px;
          color: #bdb4ff;
          background: #29264c;
          padding: 7px 10px;
          border-radius: 20px;
          white-space: nowrap;
        }

        .bar-row {
          margin-bottom: 21px;
        }

        .bar-label {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 9px;
          font-size: 12px;
          color: #aeb9d1;
        }

        .bar-track {
          height: 8px;
          border-radius: 20px;
          background: #242d43;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          min-width: 3px;
          border-radius: inherit;
          background: linear-gradient(90deg, #7064f4, #a18bff);
          transition: width 0.3s ease;
        }

        .bar-fill.green {
          background: linear-gradient(90deg, #10b981, #54dfb2);
        }

        .bar-fill.orange {
          background: linear-gradient(90deg, #e9a23b, #f7c96c);
        }

        .empty {
          padding: 24px 10px;
          text-align: center;
          color: #8491ad;
          font-size: 13px;
        }

        .pipeline-summary {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          margin-top: 22px;
        }

        .mini-stat {
          padding: 15px 12px;
          border: 1px solid #28334c;
          border-radius: 12px;
          background: #101729;
        }

        .mini-number {
          font-size: 21px;
          font-weight: 750;
          margin-bottom: 6px;
        }

        .mini-label {
          color: #8491ad;
          font-size: 11px;
        }

        .table-wrap {
          width: 100%;
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 490px;
        }

        th {
          color: #8290ad;
          font-size: 11px;
          font-weight: 600;
          text-align: left;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          padding: 0 12px 14px;
          border-bottom: 1px solid #29334a;
        }

        td {
          padding: 16px 12px;
          border-bottom: 1px solid #202a40;
          font-size: 12px;
          color: #c5cee2;
        }

        tr:last-child td {
          border-bottom: 0;
        }

        .deal-name {
          font-weight: 700;
          color: #eef2ff;
          margin-bottom: 5px;
        }

        .muted {
          font-size: 11px;
          color: #8491ad;
        }

        .status {
          display: inline-block;
          padding: 6px 9px;
          border-radius: 7px;
          font-size: 10px;
          background: #252c40;
          color: #cbd4e8;
          white-space: nowrap;
        }

        .status.won {
          background: #123a35;
          color: #6ce3b9;
        }

        .status.lost {
          background: #3d242f;
          color: #ff9cae;
        }

        .status.open {
          background: #29264b;
          color: #bcb2ff;
        }

        .notice {
          border: 1px solid #5a3e2d;
          background: #261d1a;
          color: #ffc99c;
          border-radius: 12px;
          padding: 13px 16px;
          font-size: 13px;
          margin-bottom: 20px;
          overflow-wrap: anywhere;
        }

        .footer-note {
          color: #74819d;
          font-size: 11px;
          margin-top: 20px;
          line-height: 1.6;
        }

        @media (max-width: 1100px) {
          .stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .reports-page {
            padding: 22px 15px;
          }

          .content-grid {
            grid-template-columns: 1fr;
          }

          .stats {
            gap: 11px;
          }

          .panel {
            padding: 17px;
          }

          .stat-value {
            font-size: 23px;
          }
        }

        @media (max-width: 420px) {
          .stats, .pipeline-summary {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <header className="topbar">
        <div>
          <div className="eyebrow">Analytics &amp; Insights</div>
          <h1>Reports Overview</h1>
          <p className="subtitle">
            Understand your business performance, sales pipeline
            and team activity.
          </p>
        </div>

        <div className="actions">
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            aria-label="Report date range"
          >
            <option value="all">All available data</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>

          <button
            onClick={() => void loadReports()}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>

          <button className="primary" onClick={exportReport}>
            ↓ Export CSV
          </button>
        </div>
      </header>

      {error && (
        <div className="notice" role="alert">
          Reports error: {error}
        </div>
      )}

      <section className="stats">
        <article className="panel">
          <div className="stat-top">
            <span className="stat-label">Total Customers</span>
            <span className="stat-icon">♙</span>
          </div>
          <div className="stat-value">
            {loading ? "—" : filtered.customers.length.toLocaleString("en-IN")}
          </div>
          <div className="stat-note">Customers in selected period</div>
        </article>

        <article className="panel">
          <div className="stat-top">
            <span className="stat-label">Total Leads</span>
            <span className="stat-icon">◉</span>
          </div>
          <div className="stat-value">
            {loading ? "—" : filtered.leads.length.toLocaleString("en-IN")}
          </div>
          <div className="stat-note">Potential customers identified</div>
        </article>

        <article className="panel">
          <div className="stat-top">
            <span className="stat-label">Total Deals</span>
            <span className="stat-icon">◇</span>
          </div>
          <div className="stat-value">
            {loading ? "—" : filtered.deals.length.toLocaleString("en-IN")}
          </div>
          <div className="stat-note">
            {wonDeals.length} won · {pipelineDeals.length} in pipeline
          </div>
        </article>

        <article className="panel">
          <div className="stat-top">
            <span className="stat-label">Won Deal Revenue</span>
            <span className="stat-icon">₹</span>
          </div>
          <div className="stat-value">
            {loading ? "—" : formatCurrency(revenue)}
          </div>
          <div className="stat-note">Sum of deals marked as won</div>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <h2>Lead Status Breakdown</h2>
              <p className="panel-subtitle">
                See how your leads are progressing
              </p>
            </div>
            <span className="count-pill">
              {filtered.leads.length} leads
            </span>
          </div>

          {loading ? (
            <div className="empty">Loading lead analytics...</div>
          ) : leadStatusCounts.length === 0 ? (
            <div className="empty">
              No lead data available for this period.
            </div>
          ) : (
            leadStatusCounts.map(([status, count]) => (
              <div className="bar-row" key={status}>
                <div className="bar-label">
                  <span>{status}</span>
                  <span>
                    {count} (
                    {Math.round(
                      (count / filtered.leads.length) * 100
                    )}
                    %)
                  </span>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(count / maxLeadCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <h2>Sales Pipeline</h2>
              <p className="panel-subtitle">
                Distribution of deals by current status
              </p>
            </div>
            <span className="count-pill">
              {filtered.deals.length} deals
            </span>
          </div>

          {loading ? (
            <div className="empty">Loading sales analytics...</div>
          ) : dealStatusCounts.length === 0 ? (
            <div className="empty">
              No deal data available for this period.
            </div>
          ) : (
            dealStatusCounts.map(([status, count]) => (
              <div className="bar-row" key={status}>
                <div className="bar-label">
                  <span>{status}</span>
                  <span>
                    {count} (
                    {Math.round(
                      (count / filtered.deals.length) * 100
                    )}
                    %)
                  </span>
                </div>
                <div className="bar-track">
                  <div
                    className={`bar-fill ${
                      WON_STATUSES.includes(status)
                        ? "green"
                        : LOST_STATUSES.includes(status)
                          ? "orange"
                          : ""
                    }`}
                    style={{
                      width: `${(count / maxDealCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))
          )}

          <div className="pipeline-summary">
            <div className="mini-stat">
              <div className="mini-number">{wonDeals.length}</div>
              <div className="mini-label">Won Deals</div>
            </div>
            <div className="mini-stat">
              <div className="mini-number">{pipelineDeals.length}</div>
              <div className="mini-label">Open Pipeline</div>
            </div>
            <div className="mini-stat">
              <div className="mini-number">{lostDeals.length}</div>
              <div className="mini-label">Lost Deals</div>
            </div>
          </div>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <h2>Recent Deals</h2>
              <p className="panel-subtitle">
                Latest deals available in the selected period
              </p>
            </div>
            <span className="count-pill">Latest 5</span>
          </div>

          {loading ? (
            <div className="empty">Loading deals...</div>
          ) : recentDeals.length === 0 ? (
            <div className="empty">No deals to display yet.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Deal</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDeals.map((deal, index) => {
                    const status = normalizeStatus(deal.status);

                    const statusClass = WON_STATUSES.includes(status)
                      ? "won"
                      : LOST_STATUSES.includes(status)
                        ? "lost"
                        : "open";

                    return (
                      <tr key={String(deal.id ?? index)}>
                        <td>
                          <div className="deal-name">
                            {getText(
                              deal.title ?? deal.name,
                              "Untitled Deal"
                            )}
                          </div>
                          <div className="muted">
                            {getText(
                              deal.customer_name ?? deal.company,
                              "No customer"
                            )}
                          </div>
                        </td>
                        <td>{formatCurrency(getAmount(deal))}</td>
                        <td>
                          <span className={`status ${statusClass}`}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <h2>Team Activity</h2>
              <p className="panel-subtitle">
                Task completion and lead conversion overview
              </p>
            </div>
            <span className="count-pill">Performance</span>
          </div>

          <div className="bar-row">
            <div className="bar-label">
              <span>Tasks completed</span>
              <span>
                {completedTasks} / {filtered.tasks.length}
              </span>
            </div>
            <div className="bar-track">
              <div
                className="bar-fill green"
                style={{
                  width: `${
                    filtered.tasks.length
                      ? (completedTasks / filtered.tasks.length) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="bar-row">
            <div className="bar-label">
              <span>Won deals vs leads</span>
              <span>{conversionRate.toFixed(1)}%</span>
            </div>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{
                  width: `${Math.min(conversionRate, 100)}%`,
                }}
              />
            </div>
          </div>

          <div className="pipeline-summary">
            <div className="mini-stat">
              <div className="mini-number">{filtered.tasks.length}</div>
              <div className="mini-label">Total Tasks</div>
            </div>
            <div className="mini-stat">
              <div className="mini-number">{completedTasks}</div>
              <div className="mini-label">Completed</div>
            </div>
            <div className="mini-stat">
              <div className="mini-number">
                {Math.max(
                  filtered.tasks.length - completedTasks,
                  0
                )}
              </div>
              <div className="mini-label">Remaining</div>
            </div>
          </div>

          <p className="footer-note">
            Conversion is an indicative ratio of won deals to leads
            in the selected dataset, not a cohort-based conversion rate.
          </p>
        </article>
      </section>

      <p className="footer-note">
        Reports use data returned by your SmartCRM backend. Date filters
        require a valid record creation date. Revenue includes deals
        whose status is recognized as won.
      </p>
    </main>
  );
}
