import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import api from "@/lib/api";
import { toast } from "sonner";

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const nav = useNavigate();
  const [addr, setAddr] = useState({
    full_name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "", country: "India",
  });
  const [gift, setGift] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [coupon, setCoupon] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [payment, setPayment] = useState("mock");
  const [placing, setPlacing] = useState(false);

  const applyCoupon = async () => {
    try {
      const { data } = await api.get(`/coupons/${coupon}`);
      setCouponDiscount(subtotal * data.discount_percent / 100);
      toast.success(`${data.discount_percent}% off applied`);
    } catch { toast.error("Invalid coupon"); }
  };

  const delivery = subtotal >= 999 ? 0 : 49;
  const wrap = gift ? 49 : 0;
  const total = subtotal - couponDiscount + delivery + wrap;

  const place = async (e) => {
    e.preventDefault();
    if (items.length === 0) return toast.error("Your bag is empty");
    setPlacing(true);
    try {
      const { data } = await api.post("/orders", {
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
        address: addr, payment_method: payment,
        coupon_code: coupon || null, gift_wrap: gift,
        delivery_instructions: instructions,
      });
      clear();
      toast.success("Order placed!");
      nav(`/order-success/${data.id}`);
    } catch (err) {
      toast.error("Failed to place order");
    } finally { setPlacing(false); }
  };

  return (
    <div className="container-x py-16" data-testid="checkout-page">
      <h1 className="font-heading text-5xl mb-12">Checkout</h1>
      <form onSubmit={place} className="grid lg:grid-cols-[1fr_400px] gap-12">
        <div className="space-y-10">
          <section>
            <div className="overline mb-4">Delivery address</div>
            <div className="grid grid-cols-2 gap-4">
              {[
                ["full_name","Full name",true,2],["phone","Phone",true,1],["pincode","Pincode",true,1],
                ["line1","Address line 1",true,2],["line2","Address line 2",false,2],
                ["city","City",true,1],["state","State",true,1],
              ].map(([k,l,req,col])=>(
                <input key={k} required={req} placeholder={l} value={addr[k]}
                  onChange={(e)=>setAddr({...addr, [k]:e.target.value})}
                  data-testid={`ck-${k}`}
                  className={`border-b border-black/20 py-3 focus:outline-none focus:border-black bg-transparent ${col===2?"col-span-2":""}`}/>
              ))}
              <textarea placeholder="Delivery instructions (optional)" value={instructions} onChange={(e)=>setInstructions(e.target.value)}
                data-testid="ck-instructions"
                className="col-span-2 border-b border-black/20 py-3 focus:outline-none focus:border-black bg-transparent"/>
            </div>
          </section>

          <section>
            <div className="overline mb-4">Options</div>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={gift} onChange={(e)=>setGift(e.target.checked)} data-testid="ck-gift"/>
              <span>Add signature gift wrap (₹49)</span>
            </label>
          </section>

          <section>
            <div className="overline mb-4">Payment method</div>
            <div className="space-y-2">
              {[
                ["mock","MOCK Payment (Test — no real charge)"],
                ["cod","Cash on Delivery"],
                ["upi","UPI (mocked)"],
                ["card","Credit/Debit Card (mocked)"],
              ].map(([k,l])=>(
                <label key={k} className="flex items-center gap-3 border p-3">
                  <input type="radio" name="pm" value={k} checked={payment===k} onChange={()=>setPayment(k)} data-testid={`pm-${k}`}/>
                  <span>{l}</span>
                </label>
              ))}
            </div>
          </section>
        </div>

        <aside className="bg-[#FAFAFA] p-8 h-fit">
          <div className="overline mb-4">Order summary</div>
          {items.map((it)=>(
            <div key={it.product_id} className="flex justify-between text-sm py-2">
              <span>{it.name} × {it.quantity}</span><span>₹{it.price*it.quantity}</span>
            </div>
          ))}
          <div className="border-t mt-4 pt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(0)}</span></div>
            {couponDiscount > 0 && <div className="flex justify-between text-green-700"><span>Coupon</span><span>-₹{couponDiscount.toFixed(0)}</span></div>}
            <div className="flex justify-between"><span>Delivery</span><span>{delivery === 0 ? "Free" : `₹${delivery}`}</span></div>
            {wrap > 0 && <div className="flex justify-between"><span>Gift wrap</span><span>₹{wrap}</span></div>}
          </div>
          <div className="flex justify-between font-heading text-2xl mt-4 pt-4 border-t">
            <span>Total</span><span>₹{total.toFixed(0)}</span>
          </div>
          <div className="flex gap-2 mt-6">
            <input placeholder="Coupon code" value={coupon} onChange={(e)=>setCoupon(e.target.value.toUpperCase())}
              data-testid="ck-coupon-input"
              className="flex-1 border-b py-2 bg-transparent focus:outline-none focus:border-black"/>
            <button type="button" onClick={applyCoupon} data-testid="ck-coupon-apply" className="text-sm link-gold">Apply</button>
          </div>
          <button type="submit" disabled={placing} data-testid="ck-place-order" className="btn-primary w-full mt-6">
            {placing ? "Placing…" : "Place Order"}
          </button>
        </aside>
      </form>
    </div>
  );
}
