import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function Account() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [customs, setCustoms] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [params] = useSearchParams();
  const tab = params.get("tab") || "orders";

  useEffect(() => {
    api.get("/orders/mine").then((r) => setOrders(r.data)).catch(() => {});
    api.get("/custom-orders/mine").then((r) => setCustoms(r.data)).catch(() => {});
    api.get("/wishlist").then((r) => setWishlist(r.data)).catch(() => {});
  }, []);

  const acceptQuote = async (id) => {
    await api.post(`/custom-orders/${id}/accept-quote`);
    const r = await api.get("/custom-orders/mine");
    setCustoms(r.data);
  };

  return (
    <div className="container-x py-16" data-testid="account-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="overline">Account</div>
          <h1 className="font-heading text-5xl mt-2">Hello, {user?.name}</h1>
        </div>
        <div className="flex gap-3">
          {user?.role === "admin" && (
            <a href="/admin" data-testid="acc-admin-link" className="btn-gold">Open Admin Dashboard</a>
          )}
          <button onClick={logout} data-testid="acc-logout" className="btn-outline">Sign out</button>
        </div>
      </div>

      <Tabs defaultValue={tab}>
        <TabsList className="grid grid-cols-3 max-w-md rounded-none border">
          <TabsTrigger value="orders" data-testid="tab-orders">Orders</TabsTrigger>
          <TabsTrigger value="custom" data-testid="tab-custom">Custom</TabsTrigger>
          <TabsTrigger value="wishlist" data-testid="tab-wishlist">Wishlist</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-8">
          {orders.length === 0 && <div className="text-ink-muted">No orders yet.</div>}
          {orders.map((o) => (
            <div key={o.id} className="border p-6 mb-4" data-testid={`order-${o.id}`}>
              <div className="flex justify-between">
                <div>
                  <div className="font-medium">{o.order_no}</div>
                  <div className="text-sm text-ink-muted">{new Date(o.created_at).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">₹{o.total.toFixed(0)}</div>
                  <div className="text-xs uppercase tracking-widest text-[#D4AF37]">{o.status}</div>
                </div>
              </div>
              <div className="mt-4 text-sm text-ink-muted">{o.items.map((i) => `${i.name} × ${i.quantity}`).join(", ")}</div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="custom" className="mt-8">
          {customs.length === 0 && <div className="text-ink-muted">No custom requests yet.</div>}
          {customs.map((c) => (
            <div key={c.id} className="border p-6 mb-4" data-testid={`co-${c.id}`}>
              <div className="flex justify-between">
                <div>
                  <div className="font-medium">{c.ticket_no} — {c.occasion}</div>
                  <div className="text-sm text-ink-muted mt-1">Budget: ₹{c.budget} · {c.delivery_city}</div>
                </div>
                <div className="text-xs uppercase tracking-widest text-[#D4AF37]">{c.status}</div>
              </div>
              <div className="text-sm mt-3">{c.description}</div>
              {c.quotation && (
                <div className="mt-4 bg-[#FAFAFA] p-4 border">
                  <div className="overline">Curator's quotation</div>
                  <div className="mt-2">Price: <span className="font-medium">₹{c.quotation.quoted_price}</span></div>
                  <div className="text-sm">Delivery: {c.quotation.delivery_estimate}</div>
                  {c.status === "quoted" && (
                    <button onClick={() => acceptQuote(c.id)} data-testid={`co-accept-${c.id}`} className="btn-gold mt-3">Accept & Pay Advance (mock)</button>
                  )}
                  {c.status === "paid" && <div className="mt-2 text-green-700 text-sm">Advance paid — we're crafting your gift.</div>}
                </div>
              )}
            </div>
          ))}
        </TabsContent>

        <TabsContent value="wishlist" className="mt-8">
          {wishlist.length === 0 && <div className="text-ink-muted">Your wishlist is empty.</div>}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {wishlist.map((p) => (
              <a key={p.id} href={`/product/${p.slug}`} className="block group" data-testid={`wish-${p.slug}`}>
                <div className="aspect-[4/5] overflow-hidden bg-[#FAFAFA]"><img src={p.images?.[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="" /></div>
                <div className="mt-3 font-heading text-lg">{p.name}</div>
                <div className="text-sm text-ink-muted">₹{p.discount_price || p.price}</div>
              </a>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
