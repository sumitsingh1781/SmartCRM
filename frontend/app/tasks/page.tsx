"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Task = {
  id: number | string;
  title?: string;
  description?: string;
  due_date?: string;
  status?: string;
  priority?: string;
  assigned_to?: string;
  created_at?: string;
  [key: string]: unknown;
};

function getTasks(payload: unknown): Task[] {
  if (Array.isArray(payload)) return payload as Task[];
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.tasks)) return obj.tasks as Task[];
    if (Array.isArray(obj.data)) return obj.data as Task[];
  }
  return [];
}

function taskStatus(status?: string) {
  return String(status || "PENDING").toUpperCase();
}

function formatDate(value?: string) {
  if (!value) return "No due date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function isOverdue(task: Task) {
  if (!task.due_date || ["DONE", "COMPLETED"].includes(taskStatus(task.status))) return false;
  const due = new Date(task.due_date);
  if (Number.isNaN(due.getTime())) return false;
  due.setHours(23, 59, 59, 999);
  return due.getTime() < Date.now();
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ title: "", description: "", due_date: "", status: "PENDING", priority: "MEDIUM" });

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API}/api/tasks`, { cache: "no-store" });
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      setTasks(getTasks(await response.json()));
    } catch {
      setError("Tasks load nahi ho paaye. Backend server aur /api/tasks endpoint check karo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadTasks(); }, [loadTasks]);

  const stats = useMemo(() => {
    const completed = tasks.filter((task) => ["DONE", "COMPLETED"].includes(taskStatus(task.status))).length;
    const pending = tasks.filter((task) => !["DONE", "COMPLETED"].includes(taskStatus(task.status))).length;
    const overdue = tasks.filter(isOverdue).length;
    const today = new Date();
    const dueToday = tasks.filter((task) => {
      if (!task.due_date || ["DONE", "COMPLETED"].includes(taskStatus(task.status))) return false;
      const date = new Date(task.due_date);
      return !Number.isNaN(date.getTime()) && date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
    }).length;
    return { total: tasks.length, pending, completed, overdue, dueToday };
  }, [tasks]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((task) => {
      const status = taskStatus(task.status);
      const matchesFilter = filter === "ALL"
        || (filter === "PENDING" && !["DONE", "COMPLETED"].includes(status))
        || (filter === "COMPLETED" && ["DONE", "COMPLETED"].includes(status))
        || (filter === "OVERDUE" && isOverdue(task));
      const searchable = [task.title, task.description, task.status, task.priority, task.assigned_to]
        .map((value) => String(value || "").toLowerCase()).join(" ");
      return matchesFilter && (!q || searchable.includes(q));
    }).sort((a, b) => {
      const aDate = a.due_date ? new Date(a.due_date).getTime() : Number.MAX_SAFE_INTEGER;
      const bDate = b.due_date ? new Date(b.due_date).getTime() : Number.MAX_SAFE_INTEGER;
      return aDate - bDate;
    });
  }, [tasks, search, filter]);

  async function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const response = await fetch(`${API}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, due_date: form.due_date || null }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const data = payload as { message?: string; error?: string };
        throw new Error(data.message || data.error || "Task create nahi hua. Backend route aur required fields check karo.");
      }
      setShowForm(false);
      setForm({ title: "", description: "", due_date: "", status: "PENDING", priority: "MEDIUM" });
      await loadTasks();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Kuch galat ho gaya.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleComplete(task: Task) {
    const completed = ["DONE", "COMPLETED"].includes(taskStatus(task.status));
    const nextStatus = completed ? "PENDING" : "COMPLETED";
    try {
      const response = await fetch(`${API}/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const data = body as { message?: string; error?: string };
        throw new Error(data.message || data.error || `Status update failed (${response.status})`);
      }
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Task status update nahi hua. Backend PATCH route check karo.");
    }
  }

  return (
    <div className="tasks-page">
      <style jsx>{`
        .tasks-page{color:#eef5ff;display:grid;gap:18px}
        .hero{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap}
        .eyebrow{font-size:10px;letter-spacing:.13em;font-weight:800;color:#58b4ff;margin:2px 0 9px}
        .hero h1{font-size:29px;letter-spacing:-.8px;margin:0;font-weight:800}.hero h1 span{color:#6385ff}
        .hero p{color:#8ba9cc;font-size:12px;margin:8px 0 0}
        .actions{display:flex;gap:9px}.btn{height:38px;padding:0 14px;border:1px solid #294767;border-radius:10px;color:#dcecff;background:#0c1d31;font-size:11px;font-weight:700;cursor:pointer}
        .btn.primary{background:linear-gradient(100deg,#078cff,#6940f5);border-color:transparent;color:white;box-shadow:0 6px 20px #234cff2b}
        .stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
        .stat{border:1px solid #1d3653;border-radius:13px;padding:15px;background:linear-gradient(140deg,#0c1d31,#091727);min-width:0}
        .stat-top{display:flex;justify-content:space-between;align-items:center;color:#91b1d5;font-size:11px}
        .stat-icon{width:30px;height:30px;display:grid;place-items:center;border-radius:9px;background:#0d3159;color:#43a8ff;font-size:15px}
        .stat strong{display:block;font-size:25px;margin-top:11px}.stat small{display:block;color:#7699bd;font-size:10px;margin-top:4px}
        .toolbar{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
        .search{height:39px;display:flex;align-items:center;gap:9px;padding:0 12px;border:1px solid #1e3956;border-radius:10px;background:#0a192a;min-width:230px;flex:1;max-width:390px;color:#8db1d8}
        .search input{width:100%;min-width:0;background:transparent;border:0;outline:0;color:#eef5ff;font-size:11px}
        .filters{display:flex;gap:6px;flex-wrap:wrap}.filter{border:1px solid #203953;background:#0a192a;color:#91adcc;border-radius:8px;padding:9px 11px;font-size:10px;font-weight:700;cursor:pointer}
        .filter.active{background:#103c78;border-color:#1d68ce;color:#e7f4ff}
        .card{border:1px solid #1d3653;border-radius:13px;background:linear-gradient(145deg,#0b1a2c,#091625);overflow:hidden}
        .card-head{padding:15px 17px;border-bottom:1px solid #1a3048;display:flex;justify-content:space-between;align-items:center;gap:10px}
        .card-head h2{font-size:13px;margin:0}.card-head p{font-size:10px;color:#819fbe;margin:5px 0 0}
        .count{font-size:10px;color:#8aaaca;background:#11243b;padding:6px 9px;border-radius:7px}
        .task-list{display:grid}.task-row{display:grid;grid-template-columns:34px minmax(0,1fr) auto auto;gap:12px;align-items:center;padding:14px 16px;border-bottom:1px solid #14283d}
        .task-row:last-child{border-bottom:0}.task-row:hover{background:#10223980}
        .check{width:25px;height:25px;border-radius:8px;border:1px solid #36516e;background:#0b1a2c;color:#54d6a3;cursor:pointer;font-weight:900}
        .check.done{background:#063b2e;border-color:#087b5d}
        .task-main{min-width:0}.task-main b{display:block;color:#e4effc;font-size:11px;overflow-wrap:anywhere}.task-main b.completed{text-decoration:line-through;color:#7897b7}
        .task-main p{font-size:10px;color:#7f9dbd;margin:5px 0 0;overflow-wrap:anywhere}
        .task-date{font-size:10px;color:#9ab5d2;white-space:nowrap}.task-date.overdue{color:#ff8196}
        .pill{display:inline-flex;border-radius:20px;padding:5px 8px;font-size:9px;font-weight:800;white-space:nowrap;background:#102d4d;color:#69b9ff}
        .priority-high{background:#421b2a;color:#ff8196}.priority-medium{background:#422c10;color:#ffc15d}.priority-low{background:#063b2e;color:#2be6a5}
        .empty{text-align:center;padding:38px 15px;color:#829fbe;font-size:11px}.empty strong{display:block;color:#d6e7f9;font-size:13px;margin-bottom:7px}
        .error{padding:12px 14px;border:1px solid #74344b;border-radius:10px;color:#ffb5c3;background:#351723;font-size:11px}
        .backdrop{position:fixed;inset:0;background:#020813c9;backdrop-filter:blur(5px);z-index:100;display:grid;place-items:center;padding:18px}
        .modal{width:min(540px,100%);max-height:90vh;overflow:auto;border:1px solid #294665;border-radius:16px;background:#0b1a2c;box-shadow:0 24px 90px #0008}
        .modal-head{padding:18px 20px;border-bottom:1px solid #20364f;display:flex;justify-content:space-between;align-items:flex-start}
        .modal-head h2{margin:0;font-size:17px}.modal-head p{margin:6px 0 0;color:#87a8cc;font-size:11px}
        .close{border:0;background:#152a40;color:#b8d0eb;width:30px;height:30px;border-radius:8px;font-size:18px;cursor:pointer}
        .form{padding:18px 20px;display:grid;grid-template-columns:1fr 1fr;gap:13px}
        .field{display:grid;gap:7px}.field.full{grid-column:1/-1}.field label{font-size:10px;color:#9bb9d9;font-weight:700}
        .field input,.field select,.field textarea{width:100%;border:1px solid #28435f;border-radius:9px;background:#071525;color:#e9f3ff;padding:10px 11px;outline:none;font-size:11px}
        .field input,.field select{height:39px}.field textarea{min-height:78px;resize:vertical}
        .field input:focus,.field select:focus,.field textarea:focus{border-color:#358dff;box-shadow:0 0 0 3px #1688ff1a}
        .form-error{grid-column:1/-1;color:#ff9bab;background:#351723;border-radius:8px;padding:10px;font-size:10px}
        .form-actions{grid-column:1/-1;display:flex;justify-content:flex-end;gap:9px;margin-top:5px}
        @media(max-width:850px){.stats{grid-template-columns:repeat(2,minmax(0,1fr))}.task-row{grid-template-columns:30px minmax(0,1fr) auto}.task-date{grid-column:2}.task-row .priority{grid-column:3;grid-row:1}}
        @media(max-width:540px){.hero h1{font-size:24px}.stats{gap:8px}.stat{padding:12px}.stat strong{font-size:21px}.form{grid-template-columns:1fr}.field.full,.form-error,.form-actions{grid-column:auto}.task-row{gap:8px;padding:12px}.task-date{font-size:9px}}
      `}</style>

      <header className="hero">
        <div><div className="eyebrow">◈ &nbsp; WORKSPACE / TASK MANAGEMENT</div><h1>Tasks &amp; <span>Activities</span></h1><p>Stay organized, track deadlines, and keep your team moving forward.</p></div>
        <div className="actions"><button className="btn" onClick={() => void loadTasks()} disabled={loading}>⟳ &nbsp; Refresh</button><button className="btn primary" onClick={() => { setFormError(""); setShowForm(true); }}>＋ &nbsp; Add Task</button></div>
      </header>

      <section className="stats">
        <Stat title="Total Tasks" value={stats.total} icon="▤" note="All activities" />
        <Stat title="Pending" value={stats.pending} icon="◷" note="Need your attention" />
        <Stat title="Completed" value={stats.completed} icon="✓" note="Successfully finished" />
        <Stat title="Overdue" value={stats.overdue} icon="!" note="Past their due date" />
      </section>

      {error && <div className="error">{error} <button className="btn" style={{ marginLeft: 10 }} onClick={() => void loadTasks()}>Try again</button></div>}

      <section className="toolbar">
        <label className="search"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search task or description..." aria-label="Search tasks" /><span>⌘</span></label>
        <div className="filters">{[{key:"ALL",label:"All tasks"},{key:"PENDING",label:"Pending"},{key:"COMPLETED",label:"Completed"},{key:"OVERDUE",label:"Overdue"}].map((item) => <button key={item.key} onClick={() => setFilter(item.key)} className={`filter ${filter === item.key ? "active" : ""}`}>{item.label}</button>)}</div>
      </section>

      <section className="card">
        <div className="card-head"><div><h2>Task Board</h2><p>Tasks are sorted by nearest due date.</p></div><span className="count">{filtered.length} tasks</span></div>
        <div className="task-list">
          {loading ? <div className="empty">Loading tasks...</div>
            : filtered.length === 0 ? <div className="empty"><strong>{search || filter !== "ALL" ? "No matching tasks" : "No tasks yet"}</strong>{search || filter !== "ALL" ? "Try changing your search or filter." : "Click Add Task to create your first task."}</div>
            : filtered.map((task, index) => {
              const status = taskStatus(task.status);
              const completed = ["DONE", "COMPLETED"].includes(status);
              const priority = String(task.priority || "MEDIUM").toLowerCase();
              const overdue = isOverdue(task);
              return <article className="task-row" key={task.id ?? `${task.title}-${index}`}>
                <button className={`check ${completed ? "done" : ""}`} title={completed ? "Mark as pending" : "Mark as completed"} aria-label={completed ? "Mark task as pending" : "Mark task as completed"} onClick={() => void toggleComplete(task)}>{completed ? "✓" : ""}</button>
                <div className="task-main"><b className={completed ? "completed" : ""}>{task.title || "Untitled task"}</b>{task.description && <p>{task.description}</p>}</div>
                <span className={`pill priority priority-${priority}`}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</span>
                <div className={`task-date ${overdue ? "overdue" : ""}`}>{overdue ? "⚠ Overdue · " : "◷ "}{formatDate(task.due_date)}</div>
              </article>;
            })}
        </div>
      </section>

      {showForm && <div className="backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
        <section className="modal" role="dialog" aria-modal="true" aria-labelledby="new-task-title">
          <header className="modal-head"><div><h2 id="new-task-title">Create new task</h2><p>Add a task and set its deadline and priority.</p></div><button className="close" onClick={() => setShowForm(false)} aria-label="Close">×</button></header>
          <form className="form" onSubmit={createTask}>
            <div className="field full"><label htmlFor="task-title">Task title *</label><input id="task-title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Follow up with new lead" /></div>
            <div className="field full"><label htmlFor="task-description">Description</label><textarea id="task-description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Add more details..." /></div>
            <div className="field"><label htmlFor="task-due-date">Due date</label><input id="task-due-date" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
            <div className="field"><label htmlFor="task-priority">Priority</label><select id="task-priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></div>
            <div className="field full"><label htmlFor="task-status">Status</label><select id="task-status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="PENDING">Pending</option><option value="COMPLETED">Completed</option></select></div>
            {formError && <div className="form-error">{formError}</div>}
            <div className="form-actions"><button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="btn primary" disabled={saving}>{saving ? "Saving..." : "Create Task →"}</button></div>
          </form>
        </section>
      </div>}
    </div>
  );
}

function Stat({ title, value, icon, note }: { title: string; value: number; icon: string; note: string }) {
  return <article className="stat"><div className="stat-top"><span>{title}</span><span className="stat-icon">{icon}</span></div><strong>{value}</strong><small>{note}</small></article>;
}
