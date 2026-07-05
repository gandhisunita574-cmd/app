import { useEffect, useState } from "react";
import { NavLink, Routes, Route, Link, Navigate } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { LayoutDashboard, Package, ShoppingCart, Sparkles, Users, Tag, LogOut } from "lucide-react";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  return (
    <div className="flex min-h-screen bg-white" data-testid="admin-page">
      <aside className="w-64 bg-black text-white p-6 flex flex-col">
        <Link to="/" className="font-heading text-2xl mb-10">Hamper<span className="italic text-[#D4AF37]">Store</span></Link>
        <nav className="space-y-1 flex-1">
          <A to="/admin" icon={LayoutDashboard} label="Dashboard" end />
          <A to="/admin/products" icon={Package} label="Products" />
          <A to="/admin/orders" icon={ShoppingCart} label="Orders" />
          <A to="/admin/custom" icon={Sparkles} label="Custom Requests" />
          <A to="/admin/customers" icon={Users} label="Customers" />
          <A to="/admin/coupons" icon={Tag} label="Coupons" />
        </nav>
        <div className="text-xs text-white/40 mb-4">{user?.email}</div>
        <button onClick={logout} data-testid="admin-logout" className="flex items-center gap-2 text-sm text-white/70 hover:text-[#D4AF37]">
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </aside>
      <main className="flex-1 p-10 overflow-auto">
        <Routes>
          <Route index element={<Overview />} />
          <Route path="products" element={<ProductsAdmin />} />
          <Route path="orders" element={<OrdersAdmin />} />
          <Route path="custom" element={<CustomAdmin />} />
          <Route path="customers" element={<CustomersAdmin />} />
          <Route path="coupons" element={<CouponsAdmin />} />
          <Route path="*" element={<Navigate to="." replace />} />
        </Routes>
      </main>
    </div>
  );
}

function A({ to, icon: Icon, label, end }) {
  return (
    <NavLink to={to} end={end}
      className={({isActive}) => `flex items-center gap-3 px-4 py-3 text-sm transition-colors ${isActive ? "bg-white/10 text-[#D4AF37]" : "text-white/70 hover:text-white"}`}
      data-testid={`admin-nav-${label.toLowerCase().replace(/ /g,"-")}`}>
      <Icon className="w-4 h-4" /> {label}
    </NavLink>
  );
}

function Overview() {
  const [s, setS] = useState({});
  useEffect(() => { api.get("/admin/stats").then((r) => setS(r.data)); }, []);
  const cards = [
    ["Revenue", `₹${(s.revenue || 0).toFixed(0)}`],
    ["Orders", s.orders || 0],
    ["Customers", s.customers || 0],
    ["Products", s.products || 0],
    ["Custom Requests", s.custom_orders || 0],
    ["Pending Custom", s.pending_custom || 0],
    ["Low Stock", s.low_stock || 0],
  ];
  return (
    <div>
      <h1 className="font-heading text-4xl mb-8">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map(([l,v]) => (
          <div key={l} className="border p-6" data-testid={`stat-${l.toLowerCase().replace(/ /g,"-")}`}>
            <div className="overline">{l}</div>
            <div className="font-heading text-4xl mt-2">{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const EMPTY_P = { name: "", category: "hamper", occasion: [], price: 0, discount_price: null, images: [""],
  description: "", stock: 100, tags: [], featured: false, best_seller: false, new_arrival: false };

function ProductsAdmin() {
  const [list, setList] = useState([]);
  const [editing, setEditing] = useState(null);
  const load = () => api.get("/products?limit=500").then((r) => setList(r.data));
  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      const payload = { ...editing, price: Number(editing.price), stock: Number(editing.stock),
        discount_price: editing.discount_price ? Number(editing.discount_price) : null,
        images: (editing.images || []).filter(Boolean),
        occasion: Array.isArray(editing.occasion) ? editing.occasion : String(editing.occasion || "").split(",").map(s=>s.trim()).filter(Boolean),
        tags: Array.isArray(editing.tags) ? editing.tags : String(editing.tags || "").split(",").map(s=>s.trim()).filter(Boolean),
      };
      if (editing.id) await api.put(`/products/${editing.id}`, payload);
      else await api.post("/products", payload);
      toast.success("Saved");
      setEditing(null); load();
    } catch { toast.error("Failed"); }
  };
  const del = async (id) => {
    if (!window.confirm("Delete?")) return;
    await api.delete(`/products/${id}`); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-4xl">Products</h1>
        <button onClick={() => setEditing({ ...EMPTY_P })} data-testid="admin-new-product" className="btn-primary">+ New</button>
      </div>
      <table className="w-full text-sm">
        <thead className="border-b"><tr className="text-left">
          <th className="py-3">Name</th><th>Category</th><th>Price</th><th>Stock</th><th></th>
        </tr></thead>
        <tbody>
          {list.map(p => (
            <tr key={p.id} className="border-b" data-testid={`prow-${p.id}`}>
              <td className="py-3">{p.name}</td>
              <td>{p.category}</td>
              <td>₹{p.discount_price || p.price}</td>
              <td>{p.stock}</td>
              <td className="text-right">
                <button onClick={() => setEditing({ ...p, occasion: (p.occasion||[]).join(", "), tags: (p.tags||[]).join(", ") })} className="link-gold mr-4">Edit</button>
                <button onClick={() => del(p.id)} className="text-red-700">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50" onClick={() => setEditing(null)}>
          <div className="bg-white p-8 max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-heading text-2xl mb-6">{editing.id ? "Edit" : "New"} product</h2>
            <div className="space-y-4">
              <input placeholder="Name" value={editing.name} onChange={(e)=>setEditing({...editing, name:e.target.value})}
                data-testid="pf-name" className="w-full border p-3"/>
              <select value={editing.category} onChange={(e)=>setEditing({...editing, category:e.target.value})} className="w-full border p-3" data-testid="pf-category">
                <option value="hamper">Hamper</option>
                <option value="bouquet">Bouquet</option>
              </select>
              <div className="grid grid-cols-3 gap-3">
                <input placeholder="Price" type="number" value={editing.price} onChange={(e)=>setEditing({...editing, price:e.target.value})} data-testid="pf-price" className="border p-3"/>
                <input placeholder="Discount price" type="number" value={editing.discount_price || ""} onChange={(e)=>setEditing({...editing, discount_price:e.target.value})} className="border p-3"/>
                <input placeholder="Stock" type="number" value={editing.stock} onChange={(e)=>setEditing({...editing, stock:e.target.value})} className="border p-3"/>
              </div>
              <input placeholder="Image URLs (comma separated)" value={(editing.images||[]).join(",")}
                onChange={(e)=>setEditing({...editing, images:e.target.value.split(",").map(s=>s.trim())})}
                data-testid="pf-images" className="w-full border p-3"/>
              <input placeholder="Occasions (comma)" value={editing.occasion} onChange={(e)=>setEditing({...editing, occasion:e.target.value})} className="w-full border p-3"/>
              <input placeholder="Tags (comma)" value={editing.tags} onChange={(e)=>setEditing({...editing, tags:e.target.value})} className="w-full border p-3"/>
              <textarea placeholder="Description" rows={4} value={editing.description} onChange={(e)=>setEditing({...editing, description:e.target.value})} className="w-full border p-3"/>
              <div className="flex gap-6 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" checked={editing.featured} onChange={(e)=>setEditing({...editing, featured:e.target.checked})}/> Featured</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={editing.best_seller} onChange={(e)=>setEditing({...editing, best_seller:e.target.checked})}/> Best seller</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={editing.new_arrival} onChange={(e)=>setEditing({...editing, new_arrival:e.target.checked})}/> New arrival</label>
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={()=>setEditing(null)} className="btn-outline">Cancel</button>
                <button onClick={save} data-testid="pf-save" className="btn-primary">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const load = () => api.get("/admin/orders").then((r) => setOrders(r.data));
  useEffect(() => { load(); }, []);
  const change = async (id, s) => { await api.put(`/admin/orders/${id}/status?status=${s}`); load(); toast.success("Updated"); };
  return (
    <div>
      <h1 className="font-heading text-4xl mb-8">Orders</h1>
      <table className="w-full text-sm">
        <thead className="border-b"><tr className="text-left"><th className="py-3">Order</th><th>Customer</th><th>Total</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id} className="border-b">
              <td className="py-3 font-medium">{o.order_no}</td>
              <td>{o.user_email}</td>
              <td>₹{o.total.toFixed(0)}</td>
              <td>
                <select value={o.status} onChange={(e)=>change(o.id, e.target.value)} className="border p-1 text-sm" data-testid={`ostatus-${o.id}`}>
                  {["confirmed","processing","shipped","delivered","cancelled"].map(s=><option key={s}>{s}</option>)}
                </select>
              </td>
              <td className="text-right text-xs text-ink-muted">{new Date(o.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CustomAdmin() {
  const [list, setList] = useState([]);
  const [quoting, setQuoting] = useState(null);
  const [quote, setQuote] = useState({ quoted_price: 0, delivery_estimate: "", admin_notes: "" });
  const load = () => api.get("/admin/custom-orders").then((r) => setList(r.data));
  useEffect(() => { load(); }, []);
  const setStatus = async (id, s) => { await api.put(`/admin/custom-orders/${id}/status?status=${s}`); load(); };
  const sendQuote = async () => {
    await api.put(`/admin/custom-orders/${quoting.id}/quote`, { ...quote, quoted_price: Number(quote.quoted_price) });
    toast.success("Quote sent");
    setQuoting(null); setQuote({ quoted_price: 0, delivery_estimate: "", admin_notes: "" }); load();
  };
  return (
    <div>
      <h1 className="font-heading text-4xl mb-8">Custom Requests</h1>
      {list.map(c => (
        <div key={c.id} className="border p-6 mb-4" data-testid={`cor-${c.id}`}>
          <div className="flex justify-between">
            <div>
              <div className="font-medium">{c.ticket_no} — {c.name} · {c.occasion}</div>
              <div className="text-sm text-ink-muted">{c.email} · {c.mobile} · {c.delivery_city} · ₹{c.budget} · {c.delivery_date}</div>
            </div>
            <select value={c.status} onChange={(e)=>setStatus(c.id, e.target.value)} className="border p-1 text-sm" data-testid={`cstat-${c.id}`}>
              {["pending","approved","rejected","quoted","paid","completed"].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <p className="mt-3">{c.description}</p>
          {c.reference_images?.length > 0 && (
            <div className="mt-3 flex gap-2">
              {c.reference_images.map((im, i) => <img key={i} src={im} alt="ref" className="w-20 h-20 object-cover" />)}
            </div>
          )}
          {c.quotation ? (
            <div className="mt-3 text-sm bg-[#FAFAFA] p-3">Quoted: ₹{c.quotation.quoted_price} · {c.quotation.delivery_estimate}</div>
          ) : (
            <button onClick={()=>setQuoting(c)} className="btn-outline mt-4" data-testid={`quote-btn-${c.id}`}>Send quotation</button>
          )}
        </div>
      ))}

      {quoting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6" onClick={()=>setQuoting(null)}>
          <div className="bg-white p-8 max-w-lg w-full" onClick={(e)=>e.stopPropagation()}>
            <h2 className="font-heading text-2xl mb-4">Send quotation</h2>
            <div className="space-y-4">
              <input type="number" placeholder="Price (₹)" value={quote.quoted_price} onChange={(e)=>setQuote({...quote, quoted_price:e.target.value})} data-testid="quote-price" className="w-full border p-3"/>
              <input placeholder="Delivery estimate" value={quote.delivery_estimate} onChange={(e)=>setQuote({...quote, delivery_estimate:e.target.value})} data-testid="quote-eta" className="w-full border p-3"/>
              <textarea placeholder="Notes" rows={3} value={quote.admin_notes} onChange={(e)=>setQuote({...quote, admin_notes:e.target.value})} className="w-full border p-3"/>
              <div className="flex gap-3 justify-end">
                <button onClick={()=>setQuoting(null)} className="btn-outline">Cancel</button>
                <button onClick={sendQuote} data-testid="quote-send" className="btn-primary">Send</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CustomersAdmin() {
  const [list, setList] = useState([]);
  useEffect(() => { api.get("/admin/customers").then((r) => setList(r.data)); }, []);
  return (
    <div>
      <h1 className="font-heading text-4xl mb-8">Customers</h1>
      <table className="w-full text-sm">
        <thead className="border-b"><tr className="text-left"><th className="py-3">Name</th><th>Email</th><th>Joined</th></tr></thead>
        <tbody>
          {list.map(u => (
            <tr key={u.id} className="border-b"><td className="py-3">{u.name}</td><td>{u.email}</td><td>{new Date(u.created_at).toLocaleDateString()}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CouponsAdmin() {
  const [list, setList] = useState([]);
  const [nu, setNu] = useState({ code: "", discount_percent: 10, active: true });
  const load = () => api.get("/admin/coupons").then((r) => setList(r.data));
  useEffect(() => { load(); }, []);
  const create = async () => {
    await api.post("/admin/coupons", { ...nu, discount_percent: Number(nu.discount_percent) });
    toast.success("Created"); setNu({ code: "", discount_percent: 10, active: true }); load();
  };
  const del = async (id) => { await api.delete(`/admin/coupons/${id}`); load(); };
  return (
    <div>
      <h1 className="font-heading text-4xl mb-8">Coupons</h1>
      <div className="border p-6 mb-6 grid grid-cols-4 gap-3">
        <input placeholder="Code" value={nu.code} onChange={(e)=>setNu({...nu, code:e.target.value.toUpperCase()})} data-testid="cp-code" className="border p-2"/>
        <input type="number" placeholder="% off" value={nu.discount_percent} onChange={(e)=>setNu({...nu, discount_percent:e.target.value})} className="border p-2"/>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={nu.active} onChange={(e)=>setNu({...nu, active:e.target.checked})}/> Active</label>
        <button onClick={create} data-testid="cp-create" className="btn-primary">Create</button>
      </div>
      <table className="w-full text-sm">
        <thead className="border-b"><tr className="text-left"><th className="py-3">Code</th><th>Discount</th><th>Active</th><th></th></tr></thead>
        <tbody>
          {list.map(c => (
            <tr key={c.id} className="border-b"><td className="py-3 font-medium">{c.code}</td><td>{c.discount_percent}%</td><td>{c.active ? "Yes" : "No"}</td>
              <td className="text-right"><button onClick={()=>del(c.id)} className="text-red-700">Delete</button></td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
