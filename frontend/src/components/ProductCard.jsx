import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { Heart, ShoppingBag } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";

export default function ProductCard({ product }) {
  const { add } = useCart();
  const { user } = useAuth();

  const price = product.discount_price || product.price;
  const original = product.discount_price ? product.price : null;

  const wishlist = async (e) => {
    e.preventDefault();
    if (!user || user === false) return toast.error("Please sign in to save");
    try {
      await api.post("/wishlist", { product_id: product.id });
      toast.success("Saved to wishlist");
    } catch {
      toast.error("Try again");
    }
  };

  return (
    <div className="group relative" data-testid={`product-card-${product.slug}`}>
      <Link to={`/product/${product.slug}`} className="block">
        <div className="overflow-hidden bg-[#FAFAFA] aspect-[4/5] relative">
          <img
            src={product.images?.[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          {product.discount_price && (
            <div className="absolute top-4 left-4 bg-[#D4AF37] text-white text-xs px-3 py-1 tracking-wider">SALE</div>
          )}
          {product.new_arrival && !product.discount_price && (
            <div className="absolute top-4 left-4 bg-black text-white text-xs px-3 py-1 tracking-wider">NEW</div>
          )}
          <button
            onClick={wishlist}
            data-testid={`wishlist-${product.slug}`}
            className="absolute top-4 right-4 w-9 h-9 bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Add to wishlist"
          >
            <Heart className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); add(product); toast.success("Added to bag"); }}
            data-testid={`add-cart-${product.slug}`}
            className="absolute bottom-0 inset-x-0 bg-black text-white py-3 text-xs tracking-widest uppercase translate-y-full group-hover:translate-y-0 transition-transform"
          >
            <ShoppingBag className="w-4 h-4 inline mr-2" /> Add to Bag
          </button>
        </div>
        <div className="mt-5 text-center">
          <div className="overline">{product.category === "hamper" ? "Hamper" : "Bouquet"}</div>
          <h3 className="font-heading text-xl mt-1">{product.name}</h3>
          <div className="mt-2 flex items-center justify-center gap-2 text-sm">
            <span className="font-medium">₹{price}</span>
            {original && <span className="line-through text-ink-muted">₹{original}</span>}
          </div>
        </div>
      </Link>
    </div>
  );
}
