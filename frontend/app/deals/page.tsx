"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Deal = {
  id: number | string;
  title?: string;
  name?: string;
  amount?: number | string;
  value?: number | string;
  status?: string;
  customer_name?: string;
  company?: string;
  created_at?: string;
  expected_close_date?: string;
  [key: string]: unknown;
};

function getDeals(payload: unknown): Deal[] {
  if (Array.isArray(payload)) return payload as Deal[];
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.deals)) return obj.deals as Deal[];
    if (Array.isArray(obj.data)) return obj.data as Deal[];
  }
  return [];
}

function dealTitle(deal: Deal) {
  return String(deal.title || deal.name || "Untitled deal");
}

function money(value: unknown) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number.isFinite(amount) ? amount : 0);
}

function dealStatus(status?: string) {
  const value = (status || "OPEN").toUpperCase();
  return `deal-status deal-${value.toLowerCase().replaceAll(" ", "-")}`;
}

const FILTERS = ["ALL", "OPEN", "PENDING", "WON", "LOST"];

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ title: "", amount: "", status: "OPEN", customer_name: "" });

  const loadDeals = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API}/api/deals`, { cache: "no-store" });
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      setDeals(getDeals(await response.json()));
    } catch {
      setError("Deals load nahi ho paaye. Backend server aur /api/deals endpoint check karo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadDeals(); }, [loadDeals]);

  const totals = useMemo(() => {
    const amount = (deal: Deal) => Number(deal.amount ?? deal.value ?? 0) || 0;
    const status = (deal: Deal) => String(deal.status || "OPEN").toUpperCase();
    return {
      all: deals.length,
      pipeline: deals.filter((d) => !["WON", "LOST"].includes(status(d))).reduce((sum, d) => sum + amount(d), 0),
      won: deals.filter((d) => status(d) === "WON").reduce((sum, d) => sum + amount(d), 0),
      open: deals.filter((d) => !["WON", "LOST"].includes(status(d))).length,
    };
  }, [deals]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return deals.filter((deal) => {
      const status = String(deal.status || "OPEN").toUpperCase();
      const matchesStatus = filter === "ALL" || (filter === "OPEN" ? !["WON", "LOST"].includes(status) : status === filter);
      const searchable = [dealTitle(deal), deal.customer_name, deal.company, deal.status, deal.amount]
        .map((v) => String(v ?? "").toLowerCase()).join(" ");
      return matchesStatus && (!q || searchable.includes(q));
    });
  }, [deals, search, filter]);

  async function createDeal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const response = await fetch(`${API}/api/deals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: Number(form.amount || 0) }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const data = payload as { message?: string; error?: string };
        throw new Error(data.message || data.error || "Deal create nahi hua. Backend route aur required fields check karo.");
      }
      setShowForm(false);
      setForm({ title: "", amount: "", status: "OPEN", customer_name: "" });
      await loadDeals();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Kuch galat ho gaya.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="deals-page">
      <style jsx>{`
        .deals-page{color:#eef5ff;display:grid;gap:18px}
        .hero{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap}
        .eyebrow{font-size:10px;letter-spacing:.13em;font-weight:800;color:#58b4ff;margin:2px 0 9px}
        .hero h1{font-size:29px;letter-spacing:-.8px;margin:0;font-weight:800}.hero h1 span{color:#6385ff}
        .hero p{color:#8ba9cc;font-size:12px;margin:8px 0 0}
        .actions{display:flex;gap:9px}.btn{height:38px;padding:0 14px;border:1px solid #294767;border-radius:10px;color:#dcecff;background:#0c1d31;font-size:11px;font-weight:700}
        .btn.primary{background:linear-gradient(100deg,#078cff,#6940f5);border-color:transparent;color:white;box-shadow:0 6px 20px #234cff2b}
        .stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
        .stat{border:1px solid #1d3653;border-radius:13px;padding:15px;background:linear-gradient(140deg,#0c1d31,#091727);min-width:0}
        .stat-top{display:flex;justify-content:space-between;align-items:center;color:#91b1d5;font-size:11px}
        .stat-icon{width:30px;height:30px;display:grid;place-items:center;border-radius:9px;background:#0d3159;color:#43a8ff;font-size:15px}
        .stat strong{display:block;font-size:23px;margin-top:11px;overflow-wrap:anywhere}.stat small{display:block;color:#7699bd;font-size:10px;margin-top:4px}
        .toolbar{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
        .search{height:39px;display:flex;align-items:center;gap:9px;padding:0 12px;border:1px solid #1e3956;border-radius:10px;background:#0a192a;min-width:230px;flex:1;max-width:390px;color:#8db1d8}
        .search input{width:100%;min-width:0;background:transparent;border:0;outline:0;color:#eef5ff;font-size:11px}
        .filters{display:flex;gap:6px;flex-wrap:wrap}.filter{border:1px solid #203953;background:#0a192a;color:#91adcc;border-radius:8px;padding:9px 11px;font-size:10px;font-weight:700}
        .filter.active{background:#103c78;border-color:#1d68ce;color:#e7f4ff}
        .card{border:1px solid #1d3653;border-radius:13px;background:linear-gradient(145deg,#0b1a2c,#091625);overflow:hidden}
        .card-head{padding:15px 17px;border-bottom:1px solid #1a3048;display:flex;justify-content:space-between;align-items:center;gap:10px}
        .card-head h2{font-size:13px;margin:0}.card-head p{font-size:10px;color:#819fbe;margin:5px 0 0}
        .count{font-size:10px;color:#8aaaca;background:#11243b;padding:6px 9px;border-radius:7px}
        .scroll{overflow-x:auto}table{width:100%;border-collapse:collapse;min-width:700px}
        th{text-align:left;color:#7899bb;font-size:9px;text-transform:uppercase;letter-spacing:.07em;font-weight:700;padding:13px 15px;background:#0a1727;border-bottom:1px solid #1b3047}
        td{padding:13px 15px;border-bottom:1px solid #14283d;font-size:11px;color:#c7d9ed;vertical-align:middle}
        tbody tr:hover{background:#10223980}tbody tr:last-child td{border-bottom:0}
        .deal-name{display:flex;align-items:center;gap:10px;min-width:170px}.deal-icon{width:34px;height:34px;display:grid;place-items:center;border-radius:10px;background:#192c5c;color:#82a5ff;font-size:15px}
        .deal-name b,.deal-name small{display:block}.deal-name b{font-size:11px;color:#e4effc}.deal-name small{font-size:9px;color:#7799bb;margin-top:4px}
        .muted{color:#7e9dbd}.amount{font-weight:800;color:#dbeaff;white-space:nowrap}
        .deal-status{display:inline-flex;border-radius:20px;padding:5px 8px;font-size:9px;font-weight:800;white-space:nowrap;background:#102d4d;color:#69b9ff}
        .deal-pending{background:#422c10;color:#ffc15d}.deal-won{background:#063b2e;color:#2be6a5}.deal-lost{background:#421b2a;color:#ff8196}
        .empty{text-align:center;padding:38px 15px;color:#829fbe;font-size:11px}.empty strong{display:block;color:#d6e7f9;font-size:13px;margin-bottom:7px}
        .error{padding:12px 14px;border:1px solid #74344b;border-radius:10px;color:#ffb5c3;background:#351723;font-size:11px}
        .backdrop{position:fixed;inset:0;background:#020813c9;backdrop-filter:blur(5px);z-index:100;display:grid;place-items:center;padding:18px}
        .modal{width:min(520px,100%);max-height:90vh;overflow:auto;border:1px solid #294665;border-radius:16px;background:#0b1a2c;box-shadow:0 24px 90px #0008}
        .modal-head{padding:18px 20px;border-bottom:1px solid #20364f;display:flex;justify-content:space-between;align-items:flex-start}
        .modal-head h2{margin:0;font-size:17px}.modal-head p{margin:6px 0 0;color:#87a8cc;font-size:11px}
        .close{border:0;background:#152a40;color:#b8d0eb;width:30px;height:30px;border-radius:8px;font-size:18px}
        .form{padding:18px 20px;display:grid;grid-template-columns:1fr 1fr;gap:13px}
        .field{display:grid;gap:7px}.field.full{grid-column:1/-1}.field label{font-size:10px;color:#9bb9d9;font-weight:700}
        .field input,.field select{width:100%;height:39px;border:1px solid #28435f;border-radius:9px;background:#071525;color:#e9f3ff;padding:0 11px;outline:none;font-size:11px}
        .field input:focus,.field select:focus{border-color:#358dff;box-shadow:0 0 0 3px #1688ff1a}
        .form-error{grid-column:1/-1;color:#ff9bab;background:#351723;border-radius:8px;padding:10px;font-size:10px}
        .form-actions{grid-column:1/-1;display:flex;justify-content:flex-end;gap:9px;margin-top:5px}
        @media(max-width:850px){.stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(max-width:540px){.hero h1{font-size:24px}.stats{gap:8px}.stat{padding:12px}.stat strong{font-size:19px}.form{grid-template-columns:1fr}.field.full,.form-error,.form-actions{grid-column:auto}}
      `}</style>

      <header className="hero">
        <div><div className="eyebrow">◈ &nbsp; REVENUE MANAGEMENT</div><h1>Deals &amp; <span>Opportunities</span></h1><p>Track deal values, monitor progress, and manage your revenue pipeline.</p></div>
        <div className="actions"><button className="btn" onClick={() => void loadDeals()} disabled={loading}>⟳ &nbsp; Refresh</button><button className="btn primary" onClick={() => { setFormError(""); setShowForm(true); }}>＋ &nbsp; Add Deal</button></div>
      </header>

      <section className="stats">
        <Stat title="Total Deals" value={String(totals.all)} icon="▤" note="All opportunities" />
        <Stat title="Pipeline Value" value={money(totals.pipeline)} icon="↗" note="Open and pending deals" />
        <Stat title="Won Revenue" value={money(totals.won)} icon="₹" note="Successfully closed deals" />
        <Stat title="Open Deals" value={String(totals.open)} icon="◷" note="Still in progress" />
      </section>

      {error && <div className="error">{error} <button className="btn" style={{ marginLeft: 10 }} onClick={() => void loadDeals()}>Try again</button></div>}

      <section className="toolbar">
        <label className="search"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search deal, customer, status..." aria-label="Search deals" /><span>⌘</span></label>
        <div className="filters">{FILTERS.map((status) => <button key={status} onClick={() => setFilter(status)} className={`filter ${filter === status ? "active" : ""}`}>{status === "ALL" ? "All deals" : status.charAt(0) + status.slice(1).toLowerCase()}</button>)}</div>
      </section>

      <section className="card">
        <div className="card-head"><div><h2>Deal Pipeline</h2><p>Review opportunity values and current status.</p></div><span className="count">{filtered.length} results</span></div>
        <div className="scroll"><table><thead><tr><th>Deal</th><th>Customer</th><th>Deal Value</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5}><div className="empty">Loading deals...</div></td></tr>
              : filtered.length === 0 ? <tr><td colSpan={5}><div className="empty"><strong>{search || filter !== "ALL" ? "No matching deals" : "No deals yet"}</strong>{search || filter !== "ALL" ? "Try changing your search or filter." : "Click Add Deal to add your first opportunity."}</div></td></tr>
              : filtered.map((deal, index) => {
                const title = dealTitle(deal);
                const status = String(deal.status || "OPEN").toUpperCase();
                return <tr key={deal.id ?? `${title}-${index}`}>
                  <td><div className="deal-name"><div className="deal-icon">↗</div><div><b>{title}</b><small>Deal ID: {deal.id ?? "—"}</small></div></div></td>
                  <td>{deal.customer_name || deal.company || "—"}</td>
                  <td className="amount">{money(deal.amount ?? deal.value)}</td>
                  <td><span className={dealStatus(status)}>{status.charAt(0) + status.slice(1).toLowerCase()}</span></td>
                  <td className="muted">{deal.created_at ? new Date(deal.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</td>
                </tr>;
              })}
          </tbody>
        </table></div>
      </section>

      {showForm && <div className="backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
        <section className="modal" role="dialog" aria-modal="true" aria-labelledby="new-deal-title">
          <header className="modal-head"><div><h2 id="new-deal-title">Create new deal</h2><p>Add an opportunity to your revenue pipeline.</p></div><button className="close" onClick={() => setShowForm(false)} aria-label="Close">×</button></header>
          <form className="form" onSubmit={createDeal}>
            <div className="field full"><label htmlFor="deal-title">Deal title *</label><input id="deal-title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Website Redesign Project" /></div>
            <div className="field"><label htmlFor="deal-customer">Customer / Company</label><input id="deal-customer" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} placeholder="Customer name" /></div>
            <div className="field"><label htmlFor="deal-amount">Deal value (₹)</label><input id="deal-amount" type="number" min="0" step="1" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="50000" /></div>
            <div className="field full"><label htmlFor="deal-status">Status</label><select id="deal-status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="OPEN">Open</option><option value="PENDING">Pending</option><option value="WON">Won</option><option value="LOST">Lost</option></select></div>
            {formError && <div className="form-error">{formError}</div>}
            <div className="form-actions"><button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="btn primary" disabled={saving}>{saving ? "Saving..." : "Create Deal →"}</button></div>
          </form>
        </section>
      </div>}
    </div>
  );
}

function Stat({ title, value, icon, note }: { title: string; value: string; icon: string; note: string }) {
  return <article className="stat"><div className="stat-top"><span>{title}</span><span className="stat-icon">{icon}</span></div><strong>{value}</strong><small>{note}</small></article>;
}
