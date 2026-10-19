"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Customer = {
  id: number | string;
  name?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  company?: string;
  status?: string;
  created_at?: string;
  [key: string]: unknown;
};

function getCustomers(payload: unknown): Customer[] {
  if (Array.isArray(payload)) return payload as Customer[];
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.customers)) return obj.customers as Customer[];
    if (Array.isArray(obj.data)) return obj.data as Customer[];
  }
  return [];
}

function customerName(customer: Customer) {
  return String(customer.name || customer.full_name || customer.company || "Unnamed customer");
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase() || "C";
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", status: "ACTIVE" });

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API}/api/customers`, { cache: "no-store" });
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      setCustomers(getCustomers(await response.json()));
    } catch {
      setError("Customers load nahi ho paaye. Backend server aur /api/customers endpoint check karo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadCustomers(); }, [loadCustomers]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return customers.filter((customer) => {
      const status = String(customer.status || "ACTIVE").toUpperCase();
      const matchesStatus = statusFilter === "ALL" || status === statusFilter;
      const searchable = [customerName(customer), customer.email, customer.phone, customer.company, customer.status]
        .map((value) => String(value || "").toLowerCase()).join(" ");
      return matchesStatus && (!q || searchable.includes(q));
    });
  }, [customers, search, statusFilter]);

  const activeCount = customers.filter((c) => String(c.status || "ACTIVE").toUpperCase() === "ACTIVE").length;
  const uniqueCompanies = new Set(customers.map((c) => c.company).filter(Boolean)).size;
  const withEmail = customers.filter((c) => Boolean(c.email)).length;

  async function createCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const response = await fetch(`${API}/api/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const data = payload as { message?: string; error?: string };
        throw new Error(data.message || data.error || "Customer create nahi hua. Backend route aur required fields check karo.");
      }
      setShowForm(false);
      setForm({ name: "", email: "", phone: "", company: "", status: "ACTIVE" });
      await loadCustomers();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Kuch galat ho gaya.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="customers-page">
      <style jsx>{`
        .customers-page{color:#eef5ff;display:grid;gap:18px}
        .customer-hero{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap}
        .eyebrow{font-size:10px;letter-spacing:.13em;font-weight:800;color:#58b4ff;margin:2px 0 9px}
        .customer-hero h1{font-size:29px;letter-spacing:-.8px;margin:0;font-weight:800}
        .customer-hero h1 span{color:#6385ff}
        .customer-hero p{color:#8ba9cc;font-size:12px;margin:8px 0 0}
        .actions{display:flex;gap:9px}
        .btn{height:38px;padding:0 14px;border:1px solid #294767;border-radius:10px;color:#dcecff;background:#0c1d31;font-size:11px;font-weight:700}
        .btn.primary{background:linear-gradient(100deg,#078cff,#6940f5);border-color:transparent;color:white;box-shadow:0 6px 20px #234cff2b}
        .stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
        .stat{border:1px solid #1d3653;border-radius:13px;padding:15px;background:linear-gradient(140deg,#0c1d31,#091727);min-width:0}
        .stat-top{display:flex;justify-content:space-between;align-items:center;color:#91b1d5;font-size:11px}
        .stat-icon{width:30px;height:30px;display:grid;place-items:center;border-radius:9px;background:#0d3159;color:#43a8ff;font-size:15px}
        .stat strong{display:block;font-size:25px;margin-top:11px}
        .stat small{display:block;color:#7699bd;font-size:10px;margin-top:4px}
        .toolbar{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
        .search{height:39px;display:flex;align-items:center;gap:9px;padding:0 12px;border:1px solid #1e3956;border-radius:10px;background:#0a192a;min-width:230px;flex:1;max-width:390px;color:#8db1d8}
        .search input{width:100%;min-width:0;background:transparent;border:0;outline:0;color:#eef5ff;font-size:11px}
        .filters{display:flex;gap:6px;flex-wrap:wrap}
        .filter{border:1px solid #203953;background:#0a192a;color:#91adcc;border-radius:8px;padding:9px 11px;font-size:10px;font-weight:700}
        .filter.active{background:#103c78;border-color:#1d68ce;color:#e7f4ff}
        .table-card{border:1px solid #1d3653;border-radius:13px;background:linear-gradient(145deg,#0b1a2c,#091625);overflow:hidden}
        .table-title{padding:15px 17px;border-bottom:1px solid #1a3048;display:flex;justify-content:space-between;align-items:center;gap:10px}
        .table-title h2{font-size:13px;margin:0}.table-title p{font-size:10px;color:#819fbe;margin:5px 0 0}
        .result-count{font-size:10px;color:#8aaaca;background:#11243b;padding:6px 9px;border-radius:7px}
        .table-scroll{overflow-x:auto}table{width:100%;border-collapse:collapse;min-width:740px}
        th{text-align:left;color:#7899bb;font-size:9px;text-transform:uppercase;letter-spacing:.07em;font-weight:700;padding:13px 15px;background:#0a1727;border-bottom:1px solid #1b3047}
        td{padding:13px 15px;border-bottom:1px solid #14283d;font-size:11px;color:#c7d9ed;vertical-align:middle}
        tbody tr:hover{background:#10223980}tbody tr:last-child td{border-bottom:0}
        .person{display:flex;align-items:center;gap:10px;min-width:170px}
        .avatar{width:33px;height:33px;display:grid;place-items:center;border-radius:10px;background:linear-gradient(135deg,#087cf4,#3d49d9);font-weight:800;color:white;font-size:10px;flex-shrink:0}
        .person b,.person small{display:block}.person b{font-size:11px;color:#e4effc}.person small{font-size:9px;color:#7799bb;margin-top:4px}
        .muted{color:#7e9dbd}.status{display:inline-flex;border-radius:20px;padding:5px 8px;font-size:9px;font-weight:800;background:#063b2e;color:#2be6a5}
        .status-inactive{background:#421b2a;color:#ff8196}
        .empty{text-align:center;padding:38px 15px;color:#829fbe;font-size:11px}.empty strong{display:block;color:#d6e7f9;font-size:13px;margin-bottom:7px}
        .error{padding:12px 14px;border:1px solid #74344b;border-radius:10px;color:#ffb5c3;background:#351723;font-size:11px}
        .backdrop{position:fixed;inset:0;background:#020813c9;backdrop-filter:blur(5px);z-index:100;display:grid;place-items:center;padding:18px}
        .modal{width:min(540px,100%);max-height:90vh;overflow:auto;border:1px solid #294665;border-radius:16px;background:#0b1a2c;box-shadow:0 24px 90px #0008}
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
        @media(max-width:540px){.customer-hero h1{font-size:24px}.stats{gap:8px}.stat{padding:12px}.stat strong{font-size:21px}.form{grid-template-columns:1fr}.field.full,.form-error,.form-actions{grid-column:auto}}
      `}</style>

      <header className="customer-hero">
        <div>
          <div className="eyebrow">◈ &nbsp; CUSTOMER MANAGEMENT</div>
          <h1>Customer <span>Directory</span></h1>
          <p>Manage your relationships, contact information, and customer accounts in one place.</p>
        </div>
        <div className="actions">
          <button className="btn" onClick={() => void loadCustomers()} disabled={loading}>⟳ &nbsp; Refresh</button>
          <button className="btn primary" onClick={() => { setFormError(""); setShowForm(true); }}>＋ &nbsp; Add Customer</button>
        </div>
      </header>

      <section className="stats">
        <Stat title="Total Customers" value={customers.length} icon="♙" note="All customer records" />
        <Stat title="Active Customers" value={activeCount} icon="✓" note="Currently active" />
        <Stat title="Companies" value={uniqueCompanies} icon="▦" note="Unique organizations" />
        <Stat title="Email Contacts" value={withEmail} icon="✉" note="Customers with email" />
      </section>

      {error && <div className="error">{error} <button className="btn" style={{ marginLeft: 10 }} onClick={() => void loadCustomers()}>Try again</button></div>}

      <section className="toolbar">
        <label className="search"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, company..." aria-label="Search customers" /><span>⌘</span></label>
        <div className="filters">
          {["ALL", "ACTIVE", "INACTIVE"].map((status) => <button key={status} onClick={() => setStatusFilter(status)} className={`filter ${statusFilter === status ? "active" : ""}`}>{status === "ALL" ? "All customers" : status.charAt(0) + status.slice(1).toLowerCase()}</button>)}
        </div>
      </section>

      <section className="table-card">
        <div className="table-title"><div><h2>Customer Directory</h2><p>View and manage your customer records.</p></div><span className="result-count">{filtered.length} results</span></div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Customer</th><th>Company</th><th>Phone</th><th>Status</th><th>Added</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={5}><div className="empty">Loading customers...</div></td></tr>
                : filtered.length === 0 ? <tr><td colSpan={5}><div className="empty"><strong>{search || statusFilter !== "ALL" ? "No matching customers" : "No customers yet"}</strong>{search || statusFilter !== "ALL" ? "Try changing your search or filter." : "Click Add Customer to create your first customer."}</div></td></tr>
                : filtered.map((customer, index) => {
                  const name = customerName(customer);
                  const status = String(customer.status || "ACTIVE").toUpperCase();
                  return <tr key={customer.id ?? `${name}-${index}`}>
                    <td><div className="person"><div className="avatar">{initials(name)}</div><div><b>{name}</b><small>{customer.email || "No email provided"}</small></div></div></td>
                    <td>{customer.company || "—"}</td><td className="muted">{customer.phone || "—"}</td>
                    <td><span className={`status ${status === "INACTIVE" ? "status-inactive" : ""}`}>{status.charAt(0) + status.slice(1).toLowerCase()}</span></td>
                    <td className="muted">{customer.created_at ? new Date(customer.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</td>
                  </tr>;
                })}
            </tbody>
          </table>
        </div>
      </section>

      {showForm && <div className="backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
        <section className="modal" role="dialog" aria-modal="true" aria-labelledby="new-customer-title">
          <header className="modal-head"><div><h2 id="new-customer-title">Add new customer</h2><p>Create a customer profile for your CRM.</p></div><button className="close" onClick={() => setShowForm(false)} aria-label="Close">×</button></header>
          <form className="form" onSubmit={createCustomer}>
            <div className="field"><label htmlFor="customer-name">Full name *</label><input id="customer-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Rohan Sharma" /></div>
            <div className="field"><label htmlFor="customer-company">Company</label><input id="customer-company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company name" /></div>
            <div className="field"><label htmlFor="customer-email">Email</label><input id="customer-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@company.com" /></div>
            <div className="field"><label htmlFor="customer-phone">Phone</label><input id="customer-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 ..." /></div>
            <div className="field full"><label htmlFor="customer-status">Status</label><select id="customer-status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></div>
            {formError && <div className="form-error">{formError}</div>}
            <div className="form-actions"><button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="btn primary" disabled={saving}>{saving ? "Saving..." : "Create Customer →"}</button></div>
          </form>
        </section>
      </div>}
    </div>
  );
}

function Stat({ title, value, icon, note }: { title: string; value: number; icon: string; note: string }) {
  return <article className="stat"><div className="stat-top"><span>{title}</span><span className="stat-icon">{icon}</span></div><strong>{value}</strong><small>{note}</small></article>;
}
