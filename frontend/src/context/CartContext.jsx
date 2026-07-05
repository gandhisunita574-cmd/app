import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("hs_cart") || "[]"); } catch { return []; }
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("hs_cart", JSON.stringify(items));
  }, [items]);

  const add = (product, qty = 1) => {
    setItems((prev) => {
      const i = prev.findIndex((x) => x.product_id === product.id);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], quantity: next[i].quantity + qty };
        return next;
      }
      return [
        ...prev,
        {
          product_id: product.id,
          name: product.name,
          price: product.discount_price || product.price,
          image: product.images?.[0],
          slug: product.slug,
          quantity: qty,
        },
      ];
    });
    setOpen(true);
  };
  const remove = (pid) => setItems((prev) => prev.filter((x) => x.product_id !== pid));
  const updateQty = (pid, qty) =>
    setItems((prev) => prev.map((x) => (x.product_id === pid ? { ...x, quantity: Math.max(1, qty) } : x)));
  const clear = () => setItems([]);

  const subtotal = items.reduce((s, x) => s + x.price * x.quantity, 0);
  const count = items.reduce((s, x) => s + x.quantity, 0);

  return (
    <CartContext.Provider value={{ items, add, remove, updateQty, clear, subtotal, count, open, setOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
