"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Lead = {
  id: number | string;
  name?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: string;
  status?: string;
  created_at?: string;
  [key: string]: unknown;
};

const STATUSES = ["ALL", "NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "WON", "LOST"];

function getRows(payload: unknown): Lead[] {
  if (Array.isArray(payload)) return payload as Lead[];
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.leads)) return obj.leads as Lead[];
    if (Array.isArray(obj.data)) return obj.data as Lead[];
  }
  return [];
}

function leadName(lead: Lead) {
  return String(lead.name || lead.full_name || lead.company || "Unnamed lead");
}

function statusClass(status?: string) {
  const value = (status || "NEW").toLowerCase().replaceAll(" ", "-");
  return `lead-status status-${value}`;
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase() || "L";
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", source: "Website", status: "NEW" });

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API}/api/leads`, { cache: "no-store" });
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      const payload: unknown = await response.json();
      setLeads(getRows(payload));
    } catch {
      setError("Leads load nahi ho paaye. Backend server aur /api/leads endpoint check karo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLeads();
  }, [loadLeads]);

  const counts = useMemo(() => {
    const count = (status: string) => leads.filter((lead) => String(lead.status || "NEW").toUpperCase() === status).length;
    return {
      all: leads.length,
      new: count("NEW"),
      contacted: count("CONTACTED"),
      qualified: count("QUALIFIED"),
      converted: count("WON"),
    };
  }, [leads]);

  const visibleLeads = useMemo(() => {
    const query = search.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesStatus = filter === "ALL" || String(lead.status || "NEW").toUpperCase() === filter;
      const searchable = [leadName(lead), lead.email, lead.phone, lead.company, lead.source, lead.status]
        .map((value) => String(value || "").toLowerCase()).join(" ");
      return matchesStatus && (!query || searchable.includes(query));
    });
  }, [leads, search, filter]);

  async function createLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const response = await fetch(`${API}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error((payload as { message?: string; error?: string }).message || (payload as { error?: string }).error || "Lead create nahi hua. Backend route aur required fields check karo.");
      setShowForm(false);
      setForm({ name: "", email: "", phone: "", company: "", source: "Website", status: "NEW" });
      await loadLeads();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Kuch galat ho gaya.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="leads-page">
      <style jsx>{`
        .leads-page{color:#eef5ff;display:grid;gap:18px}
        .lead-hero{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap}
        .lead-eyebrow{font-size:10px;letter-spacing:.13em;font-weight:800;color:#58b4ff;margin:2px 0 9px}
        .lead-hero h1{font-size:29px;letter-spacing:-.8px;margin:0;font-weight:800}
        .lead-hero h1 span{color:#6385ff}
        .lead-hero p{color:#8ba9cc;font-size:12px;margin:8px 0 0}
        .lead-actions{display:flex;gap:9px}
        .lead-btn{height:38px;padding:0 14px;border:1px solid #294767;border-radius:10px;color:#dcecff;background:#0c1d31;font-size:11px;font-weight:700}
        .lead-btn.primary{background:linear-gradient(100deg,#078cff,#6940f5);border-color:transparent;color:white;box-shadow:0 6px 20px #234cff2b}
        .lead-summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
        .lead-stat{border:1px solid #1d3653;border-radius:13px;padding:15px;background:linear-gradient(140deg,#0c1d31,#091727);min-width:0}
        .lead-stat-top{display:flex;justify-content:space-between;align-items:center;color:#91b1d5;font-size:11px}
        .lead-stat-icon{width:30px;height:30px;display:grid;place-items:center;border-radius:9px;background:#0d3159;color:#43a8ff;font-size:15px}
        .lead-stat strong{display:block;font-size:25px;margin-top:11px}
        .lead-stat small{display:block;color:#7699bd;font-size:10px;margin-top:4px}
        .lead-toolbar{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
        .lead-search{height:39px;display:flex;align-items:center;gap:9px;padding:0 12px;border:1px solid #1e3956;border-radius:10px;background:#0a192a;min-width:230px;flex:1;max-width:390px;color:#8db1d8}
        .lead-search input{width:100%;min-width:0;background:transparent;border:0;outline:0;color:#eef5ff;font-size:11px}
        .lead-filters{display:flex;gap:6px;flex-wrap:wrap}
        .lead-filter{border:1px solid #203953;background:#0a192a;color:#91adcc;border-radius:8px;padding:9px 11px;font-size:10px;font-weight:700}
        .lead-filter.active{background:#103c78;border-color:#1d68ce;color:#e7f4ff}
        .lead-table-card{border:1px solid #1d3653;border-radius:13px;background:linear-gradient(145deg,#0b1a2c,#091625);overflow:hidden}
        .table-title{padding:15px 17px;border-bottom:1px solid #1a3048;display:flex;justify-content:space-between;align-items:center;gap:10px}
        .table-title h2{font-size:13px;margin:0}.table-title p{font-size:10px;color:#819fbe;margin:5px 0 0}
        .result-count{font-size:10px;color:#8aaaca;background:#11243b;padding:6px 9px;border-radius:7px}
        .table-scroll{overflow-x:auto}
        table{width:100%;border-collapse:collapse;min-width:720px}
        th{text-align:left;color:#7899bb;font-size:9px;text-transform:uppercase;letter-spacing:.07em;font-weight:700;padding:13px 15px;background:#0a1727;border-bottom:1px solid #1b3047}
        td{padding:13px 15px;border-bottom:1px solid #14283d;font-size:11px;color:#c7d9ed;vertical-align:middle}
        tbody tr:hover{background:#10223980}tbody tr:last-child td{border-bottom:0}
        .person{display:flex;align-items:center;gap:10px;min-width:170px}
        .person-avatar{width:33px;height:33px;display:grid;place-items:center;border-radius:10px;background:linear-gradient(135deg,#087cf4,#3d49d9);font-weight:800;color:white;font-size:10px;flex-shrink:0}
        .person b,.person small{display:block}.person b{font-size:11px;color:#e4effc}.person small{font-size:9px;color:#7799bb;margin-top:4px}
        .company-name{color:#c8d9ec}.muted{color:#7e9dbd}
        .lead-status{display:inline-flex;align-items:center;border-radius:20px;padding:5px 8px;font-size:9px;font-weight:800;white-space:nowrap;background:#102d4d;color:#69b9ff}
        .status-contacted{background:#291d54;color:#b6a0ff}.status-qualified{background:#063d3b;color:#28e1cb}.status-proposal{background:#422c10;color:#ffc15d}.status-won{background:#063b2e;color:#2be6a5}.status-lost{background:#421b2a;color:#ff8196}
        .table-empty{text-align:center;padding:38px 15px;color:#829fbe;font-size:11px}
        .table-empty strong{display:block;color:#d6e7f9;font-size:13px;margin-bottom:7px}
        .error-box{padding:12px 14px;border:1px solid #74344b;border-radius:10px;color:#ffb5c3;background:#351723;font-size:11px}
        .modal-backdrop{position:fixed;inset:0;background:#020813c9;backdrop-filter:blur(5px);z-index:100;display:grid;place-items:center;padding:18px}
        .lead-modal{width:min(540px,100%);max-height:90vh;overflow:auto;border:1px solid #294665;border-radius:16px;background:#0b1a2c;box-shadow:0 24px 90px #0008}
        .modal-head{padding:18px 20px;border-bottom:1px solid #20364f;display:flex;justify-content:space-between;align-items:flex-start}
        .modal-head h2{margin:0;font-size:17px}.modal-head p{margin:6px 0 0;color:#87a8cc;font-size:11px}
        .close-btn{border:0;background:#152a40;color:#b8d0eb;width:30px;height:30px;border-radius:8px;font-size:18px}
        .lead-form{padding:18px 20px;display:grid;grid-template-columns:1fr 1fr;gap:13px}
        .field{display:grid;gap:7px}.field.full{grid-column:1/-1}.field label{font-size:10px;color:#9bb9d9;font-weight:700}
        .field input,.field select{width:100%;height:39px;border:1px solid #28435f;border-radius:9px;background:#071525;color:#e9f3ff;padding:0 11px;outline:none;font-size:11px}
        .field input:focus,.field select:focus{border-color:#358dff;box-shadow:0 0 0 3px #1688ff1a}
        .form-error{grid-column:1/-1;color:#ff9bab;background:#351723;border-radius:8px;padding:10px;font-size:10px}
        .form-actions{grid-column:1/-1;display:flex;justify-content:flex-end;gap:9px;margin-top:5px}
        @media(max-width:850px){.lead-summary{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(max-width:540px){.lead-hero h1{font-size:24px}.lead-summary{gap:8px}.lead-stat{padding:12px}.lead-stat strong{font-size:21px}.lead-filters{width:100%}.lead-filter{padding:8px}.lead-form{grid-template-columns:1fr}.field.full,.form-error,.form-actions{grid-column:auto}}
      `}</style>

      <header className="lead-hero">
        <div>
          <div className="lead-eyebrow">◈ &nbsp; SALES MANAGEMENT / LEADS</div>
          <h1>Sales <span>Leads</span></h1>
          <p>Track prospects, manage follow-ups, and move opportunities toward conversion.</p>
        </div>
        <div className="lead-actions">
          <button className="lead-btn" onClick={() => void loadLeads()} disabled={loading}>⟳ &nbsp; Refresh</button>
          <button className="lead-btn primary" onClick={() => { setFormError(""); setShowForm(true); }}>＋ &nbsp; Add Lead</button>
        </div>
      </header>

      <section className="lead-summary">
        <Stat title="Total Leads" value={counts.all} icon="◎" note="All prospects" />
        <Stat title="New Leads" value={counts.new} icon="✦" note="Awaiting first contact" />
        <Stat title="Qualified Leads" value={counts.qualified} icon="✓" note="Potential opportunities" />
        <Stat title="Converted" value={counts.converted} icon="↗" note="Won opportunities" />
      </section>

      {error && <div className="error-box">{error} <button className="lead-btn" style={{ marginLeft: 10 }} onClick={() => void loadLeads()}>Try again</button></div>}

      <section className="lead-toolbar">
        <label className="lead-search"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, company..." aria-label="Search leads" /><span>⌘</span></label>
        <div className="lead-filters" aria-label="Filter leads by status">
          {STATUSES.map((status) => <button key={status} onClick={() => setFilter(status)} className={`lead-filter ${filter === status ? "active" : ""}`}>{status === "ALL" ? "All leads" : status.charAt(0) + status.slice(1).toLowerCase()}</button>)}
        </div>
      </section>

      <section className="lead-table-card">
        <div className="table-title"><div><h2>Lead Directory</h2><p>Manage and review your sales prospects.</p></div><span className="result-count">{visibleLeads.length} results</span></div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Lead</th><th>Company</th><th>Source</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={5}><div className="table-empty">Loading leads...</div></td></tr>
                : visibleLeads.length === 0 ? <tr><td colSpan={5}><div className="table-empty"><strong>{search || filter !== "ALL" ? "No matching leads" : "No leads yet"}</strong>{search || filter !== "ALL" ? "Try changing your search or filter." : "Click Add Lead to create your first prospect."}</div></td></tr>
                : visibleLeads.map((lead, index) => {
                  const name = leadName(lead);
                  const status = String(lead.status || "NEW").toUpperCase();
                  return <tr key={lead.id ?? `${name}-${index}`}>
                    <td><div className="person"><div className="person-avatar">{initials(name)}</div><div><b>{name}</b><small>{lead.email || lead.phone || "No contact details"}</small></div></div></td>
                    <td className="company-name">{lead.company || "—"}</td>
                    <td className="muted">{lead.source || "—"}</td>
                    <td><span className={statusClass(status)}>{status.charAt(0) + status.slice(1).toLowerCase()}</span></td>
                    <td className="muted">{lead.created_at ? new Date(lead.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</td>
                  </tr>;
                })}
            </tbody>
          </table>
        </div>
      </section>

      {showForm && <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
        <section className="lead-modal" role="dialog" aria-modal="true" aria-labelledby="new-lead-title">
          <header className="modal-head"><div><h2 id="new-lead-title">Create new lead</h2><p>Add a prospect to your sales pipeline.</p></div><button className="close-btn" onClick={() => setShowForm(false)} aria-label="Close">×</button></header>
          <form className="lead-form" onSubmit={createLead}>
            <div className="field"><label htmlFor="lead-name">Full name *</label><input id="lead-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Rohan Sharma" /></div>
            <div className="field"><label htmlFor="lead-company">Company</label><input id="lead-company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company name" /></div>
            <div className="field"><label htmlFor="lead-email">Email</label><input id="lead-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@company.com" /></div>
            <div className="field"><label htmlFor="lead-phone">Phone</label><input id="lead-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 ..." /></div>
            <div className="field"><label htmlFor="lead-source">Source</label><select id="lead-source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}><option>Website</option><option>LinkedIn</option><option>Referral</option><option>Advertisement</option><option>Cold Call</option><option>Other</option></select></div>
            <div className="field"><label htmlFor="lead-status">Status</label><select id="lead-status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="NEW">New</option><option value="CONTACTED">Contacted</option><option value="QUALIFIED">Qualified</option><option value="PROPOSAL">Proposal</option></select></div>
            {formError && <div className="form-error">{formError}</div>}
            <div className="form-actions"><button type="button" className="lead-btn" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="lead-btn primary" disabled={saving}>{saving ? "Saving..." : "Create Lead →"}</button></div>
          </form>
        </section>
      </div>}
    </div>
  );
}

function Stat({ title, value, icon, note }: { title: string; value: number; icon: string; note: string }) {
  return <article className="lead-stat"><div className="lead-stat-top"><span>{title}</span><span className="lead-stat-icon">{icon}</span></div><strong>{value}</strong><small>{note}</small></article>;
}
