import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Heart, Share2, Truck, Shield, RotateCcw, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import ProductCard from "@/components/ProductCard";

export default function ProductDetail() {
  const { slug } = useParams();
  const nav = useNavigate();
  const { add, setOpen } = useCart();
  const { user } = useAuth();
  const [p, setP] = useState(null);
  const [img, setImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [pincode, setPincode] = useState("");
  const [pinResult, setPinResult] = useState(null);

  useEffect(() => {
    setImg(0);
    api.get(`/products/${slug}`).then((r) => setP(r.data));
  }, [slug]);

  useEffect(() => {
    if (!p) return;
    api.get(`/products?category=${p.category}&limit=8`).then((r) => setRelated(r.data.filter(x => x.id !== p.id).slice(0, 4)));
    api.get(`/products/${p.id}/reviews`).then((r) => setReviews(r.data));
  }, [p]);

  if (!p) return <div className="container-x py-24">Loading…</div>;

  const price = p.discount_price || p.price;

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user || user === false) return toast.error("Sign in to review");
    try {
      await api.post(`/products/${p.id}/reviews`, { rating, comment });
      setComment("");
      const r = await api.get(`/products/${p.id}/reviews`);
      setReviews(r.data);
      toast.success("Review posted");
    } catch { toast.error("Failed"); }
  };

  const checkPin = async () => {
    try {
      const r = await api.post("/pincode/check", { pincode });
      setPinResult(r.data);
    } catch { toast.error("Failed"); }
  };

  const share = () => {
    if (navigator.share) navigator.share({ title: p.name, url: window.location.href });
    else { navigator.clipboard.writeText(window.location.href); toast.success("Link copied"); }
  };

  const addWishlist = async () => {
    if (!user || user === false) return toast.error("Sign in first");
    try { await api.post("/wishlist", { product_id: p.id }); toast.success("Added to wishlist"); }
    catch { toast.error("Failed"); }
  };

  return (
    <div data-testid="product-detail-page">
      <div className="container-x py-12 grid lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Images */}
        <div>
          <div className="aspect-[4/5] overflow-hidden bg-[#FAFAFA] group">
            <img src={p.images?.[img]} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-zoom-in" />
          </div>
          {p.images?.length > 1 && (
            <div className="mt-4 flex gap-3">
              {p.images.map((im, i) => (
                <button key={i} onClick={() => setImg(i)} data-testid={`thumb-${i}`}
                  className={`w-20 aspect-square overflow-hidden border ${img === i ? "border-[#D4AF37]" : "border-transparent"}`}>
                  <img src={im} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="overline">{p.category === "hamper" ? "Gift Hamper" : "Bouquet"}</div>
          <h1 className="font-heading text-5xl mt-2">{p.name}</h1>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl">₹{price}</span>
            {p.discount_price && <span className="line-through text-ink-muted">₹{p.price}</span>}
          </div>
          <p className="mt-8 text-ink-muted leading-relaxed">{p.description}</p>

          <div className="mt-10 flex items-center gap-4">
            <div className="flex items-center border border-black">
              <button onClick={() => setQty(Math.max(1, qty - 1))} data-testid="qty-dec" className="w-10 h-12 flex items-center justify-center"><Minus className="w-4 h-4"/></button>
              <span className="w-10 text-center">{qty}</span>
              <button onClick={() => setQty(qty + 1)} data-testid="qty-inc" className="w-10 h-12 flex items-center justify-center"><Plus className="w-4 h-4"/></button>
            </div>
            <button onClick={() => { add(p, qty); }} data-testid="add-to-cart-btn" className="btn-primary flex-1">Add to Bag</button>
          </div>
          <button onClick={() => { add(p, qty); setOpen(false); nav("/checkout"); }} data-testid="pdp-buy-now" className="btn-gold w-full mt-3">Buy Now</button>

          <div className="mt-4 flex items-center gap-6 text-sm">
            <button onClick={addWishlist} data-testid="pdp-wishlist" className="flex items-center gap-2 text-ink-muted hover:text-black"><Heart className="w-4 h-4" /> Save</button>
            <button onClick={share} data-testid="pdp-share" className="flex items-center gap-2 text-ink-muted hover:text-black"><Share2 className="w-4 h-4" /> Share</button>
          </div>

          <div className="mt-10 border-t pt-6">
            <div className="overline mb-3">Delivery</div>
            <div className="flex gap-2">
              <input value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="Enter pincode"
                data-testid="pincode-input"
                className="border-b border-black/20 py-2 flex-1 focus:outline-none focus:border-black" />
              <button onClick={checkPin} data-testid="pincode-check-btn" className="btn-outline py-2 px-4">Check</button>
            </div>
            {pinResult && (
              <div className="mt-3 text-sm" data-testid="pincode-result">
                {pinResult.deliverable ? (
                  <span className="text-green-700">✓ Delivery available in {pinResult.estimated_days}</span>
                ) : (
                  <span className="text-red-700">Not deliverable to this pincode</span>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 text-xs text-ink-muted">
            <div className="flex flex-col items-center text-center gap-2"><Truck className="w-5 h-5"/>Fastest delivery</div>
            <div className="flex flex-col items-center text-center gap-2"><Shield className="w-5 h-5"/>Secure checkout</div>
            <div className="flex flex-col items-center text-center gap-2"><RotateCcw className="w-5 h-5"/>Returns on damage only</div>
          </div>

          <div className="mt-6 border-l-2 border-[#D4AF37] pl-4 text-xs text-ink-muted leading-relaxed">
            <span className="font-medium text-black">Note:</span> As our hampers and bouquets are hand-crafted and perishable, returns are accepted <span className="font-medium text-black">only for damaged products</span>. Please share a photo within 24 hours of delivery — we'll arrange a replacement or refund.
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="container-x py-16 border-t">
        <h2 className="font-heading text-3xl mb-8">Customer Reviews</h2>
        <div className="grid md:grid-cols-[2fr_1fr] gap-12">
          <div className="space-y-6">
            {reviews.length === 0 && <div className="text-ink-muted">Be the first to review this product.</div>}
            {reviews.map((r) => (
              <div key={r.id} className="border-b pb-6" data-testid={`review-${r.id}`}>
                <div className="text-[#D4AF37]">{"★".repeat(r.rating)}<span className="text-black/20">{"★".repeat(5 - r.rating)}</span></div>
                <div className="mt-2 font-medium">{r.user_name}</div>
                <p className="text-ink-muted mt-1">{r.comment}</p>
              </div>
            ))}
          </div>
          <form onSubmit={submitReview} className="space-y-4">
            <div className="overline">Write a review</div>
            <select value={rating} onChange={(e) => setRating(+e.target.value)} data-testid="review-rating" className="w-full border py-2 px-3">
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}
            </select>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} required rows={4}
              data-testid="review-comment"
              className="w-full border p-3" placeholder="Share your thoughts…" />
            <button className="btn-primary w-full" data-testid="review-submit">Submit</button>
          </form>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="container-x py-16 border-t">
          <h2 className="font-heading text-3xl mb-8">You may also love</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {related.map((r) => <ProductCard key={r.id} product={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}
