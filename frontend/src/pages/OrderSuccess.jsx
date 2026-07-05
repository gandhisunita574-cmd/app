import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/lib/api";
import { CheckCircle2 } from "lucide-react";

export default function OrderSuccess() {
  const { id } = useParams();
  const [o, setO] = useState(null);
  useEffect(() => { api.get(`/orders/${id}`).then((r) => setO(r.data)); }, [id]);
  if (!o) return <div className="container-x py-24">Loading…</div>;
  return (
    <div className="container-x py-24 max-w-2xl text-center" data-testid="order-success-page">
      <CheckCircle2 className="w-16 h-16 text-[#D4AF37] mx-auto" strokeWidth={1}/>
      <div className="overline mt-6">Confirmed</div>
      <h1 className="font-heading text-5xl mt-4">Order placed.</h1>
      <p className="text-ink-muted mt-4">Order <span className="text-black font-medium">{o.order_no}</span> is being prepared. We'll notify you at each step.</p>
      <div className="bg-[#FAFAFA] p-6 mt-8 text-left">
        {o.items.map((i, idx) => (
          <div key={idx} className="flex justify-between py-2 text-sm">
            <span>{i.name} × {i.quantity}</span><span>₹{i.price * i.quantity}</span>
          </div>
        ))}
        <div className="flex justify-between font-heading text-2xl mt-4 pt-4 border-t"><span>Total</span><span>₹{o.total.toFixed(0)}</span></div>
      </div>
      <div className="mt-10 flex gap-4 justify-center">
        <Link to="/account" className="btn-primary">View orders</Link>
        <Link to="/shop" className="btn-outline">Continue shopping</Link>
      </div>
    </div>
  );
}
