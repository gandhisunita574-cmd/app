import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, Trash2 } from "lucide-react";

export default function Cart() {
  const { items, remove, updateQty, subtotal } = useCart();

  if (items.length === 0) return (
    <div className="container-x py-24 text-center" data-testid="cart-empty">
      <div className="overline">Bag</div>
      <h1 className="font-heading text-5xl mt-2">Your bag is empty</h1>
      <Link to="/shop" className="btn-primary mt-10 inline-block">Continue shopping</Link>
    </div>
  );

  return (
    <div className="container-x py-16" data-testid="cart-page">
      <h1 className="font-heading text-5xl mb-12">Shopping Bag</h1>
      <div className="grid lg:grid-cols-[1fr_400px] gap-12">
        <div>
          {items.map((it) => (
            <div key={it.product_id} className="flex gap-6 py-6 border-b" data-testid={`row-${it.product_id}`}>
              <img src={it.image} alt={it.name} className="w-24 h-32 object-cover"/>
              <div className="flex-1">
                <div className="font-heading text-2xl">{it.name}</div>
                <div className="text-sm text-ink-muted mt-1">₹{it.price}</div>
                <div className="flex items-center gap-3 mt-4">
                  <button onClick={() => updateQty(it.product_id, it.quantity - 1)} className="w-8 h-8 border"><Minus className="w-3 h-3 mx-auto"/></button>
                  <span>{it.quantity}</span>
                  <button onClick={() => updateQty(it.product_id, it.quantity + 1)} className="w-8 h-8 border"><Plus className="w-3 h-3 mx-auto"/></button>
                  <button onClick={() => remove(it.product_id)} className="ml-6 text-ink-muted hover:text-red-600 text-sm flex items-center gap-1"><Trash2 className="w-4 h-4"/> Remove</button>
                </div>
              </div>
              <div className="font-medium">₹{(it.price * it.quantity).toFixed(0)}</div>
            </div>
          ))}
        </div>
        <div className="bg-[#FAFAFA] p-8 h-fit">
          <div className="overline mb-4">Summary</div>
          <div className="flex justify-between py-3 border-b">
            <span>Subtotal</span><span>₹{subtotal.toFixed(0)}</span>
          </div>
          <div className="flex justify-between py-3 border-b text-sm text-ink-muted">
            <span>Delivery</span><span>{subtotal >= 999 ? "Free" : "₹49"}</span>
          </div>
          <div className="flex justify-between py-3 font-heading text-2xl">
            <span>Total</span><span>₹{(subtotal + (subtotal >= 999 ? 0 : 49)).toFixed(0)}</span>
          </div>
          <Link to="/checkout" data-testid="cart-checkout" className="btn-primary w-full mt-4">Proceed to Checkout</Link>
        </div>
      </div>
    </div>
  );
}
