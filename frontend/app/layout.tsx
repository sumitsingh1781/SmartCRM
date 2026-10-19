"use client";
import "./globals.css";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const nav = [{label:"Dashboard",href:"/",icon:"⌂"},{label:"Customers",href:"/customers",icon:"♙"},{label:"Leads",href:"/leads",icon:"◎"},{label:"Deals",href:"/deals",icon:"◆"},{label:"Tasks",href:"/tasks",icon:"✓"}];

export default function RootLayout({children}:{children:React.ReactNode}) {
 const path=usePathname(), router=useRouter();
 const [name,setName]=useState("Sumit Singh"),[search,setSearch]=useState("");
 useEffect(()=>{try{const u=JSON.parse(localStorage.getItem("user")||"{}");if(u.name)setName(u.name)}catch{}},[]);
 const auth=path==="/login"||path==="/register";
 return <html lang="en"><body>{auth?children:<div className="crm-shell">
  <aside className="crm-sidebar">
   <div className="brand"><div className="brand-logo">S</div><div><b>SmartCRM</b><small>AI-Powered CRM Platform</small></div></div>
   <label className="nav-caption">WORKSPACE</label><nav>{nav.map(n=><button key={n.href} onClick={()=>router.push(n.href)} className={"nav-item "+(path===n.href?"active":"")}><span className="nav-icon">{n.icon}</span>{n.label}</button>)}</nav>
   <div className="nav-divider"/><label className="nav-caption">MANAGEMENT</label>
   
<button
  className={"nav-item " + (path === "/reports" ? "active" : "")}
  onClick={() => router.push("/reports")}
>
  <span className="nav-icon">▤</span>
  Reports
</button>

<button
  className={"nav-item " + (path === "/settings" ? "active" : "")}
  onClick={() => router.push("/settings")}
>
  <span className="nav-icon">⚙</span>
  Settings
</button>

   <div className="sidebar-spacer"/><div className="ai-promo"><div className="ai-promo-icon">✦</div><b>SmartCRM AI</b><p>Your AI business assistant is always here to help.</p><button onClick={()=>router.push("/ai")}>Open AI Assistant →</button></div><div className="system-online">● &nbsp;System Online</div>
  </aside>
  <section className="crm-main"><header className="topbar"><div className="global-search">⌕ <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search customers, leads, deals..."/><kbd>Ctrl + K</kbd></div><div className="topbar-right"><button className="notify">♧<i/></button><div className="user-avatar">{name.split(" ").map(x=>x[0]).join("").slice(0,2).toUpperCase()}</div><div className="user-copy"><b>{name}</b><small>Admin</small></div><span>⌄</span></div></header><main className="crm-content">{children}</main></section>
 </div>}</body></html>;
}