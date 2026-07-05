import { useCart } from "@/context/CartContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";

export default function CartDrawer() {
  const { open, setOpen, items, remove, updateQty, subtotal } = useCart();
  const nav = useNavigate();
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col" data-testid="cart-drawer">
        <SheetHeader>
          <SheetTitle className="font-heading text-2xl">Shopping Bag</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-auto py-6">
          {items.length === 0 && <div className="text-center text-ink-muted mt-16">Your bag is empty</div>}
          {items.map((it) => (
            <div key={it.product_id} className="flex gap-4 py-4 border-b" data-testid={`cart-item-${it.product_id}`}>
              <img src={it.image} alt={it.name} className="w-20 h-24 object-cover" />
              <div className="flex-1">
                <div className="font-heading text-lg">{it.name}</div>
                <div className="text-sm text-ink-muted">₹{it.price}</div>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => updateQty(it.product_id, it.quantity - 1)} className="w-7 h-7 border flex items-center justify-center" data-testid={`qty-minus-${it.product_id}`}><Minus className="w-3 h-3"/></button>
                  <span className="w-8 text-center text-sm">{it.quantity}</span>
                  <button onClick={() => updateQty(it.product_id, it.quantity + 1)} className="w-7 h-7 border flex items-center justify-center" data-testid={`qty-plus-${it.product_id}`}><Plus className="w-3 h-3"/></button>
                </div>
              </div>
              <button onClick={() => remove(it.product_id)} className="text-ink-muted hover:text-red-600" data-testid={`cart-remove-${it.product_id}`}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div className="border-t pt-4 space-y-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span><span className="font-medium">₹{subtotal.toFixed(0)}</span>
            </div>
            <button
              onClick={() => { setOpen(false); nav("/checkout"); }}
              data-testid="checkout-btn"
              className="btn-primary w-full"
            >
              Checkout
            </button>
            <Link to="/cart" onClick={() => setOpen(false)} className="block text-center text-sm underline">View bag</Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
