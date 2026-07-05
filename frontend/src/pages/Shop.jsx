import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { Search } from "lucide-react";

const OCCASIONS = ["Birthday", "Anniversary", "Wedding", "Corporate", "Baby Shower", "Festivals", "Valentine's Day", "Mother's Day", "Father's Day", "Congratulations"];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(params.get("q") || "");

  const category = params.get("category") || "";
  const occasion = params.get("occasion") || "";
  const sort = params.get("sort") || "newest";
  const min = Number(params.get("min") || 0);
  const max = Number(params.get("max") || 100000);

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (category) qs.set("category", category);
    if (occasion) qs.set("occasion", occasion);
    if (sort) qs.set("sort", sort);
    if (q) qs.set("q", q);
    api.get(`/products?${qs.toString()}`).then((r) => {
      setProducts(r.data.filter((p) => (p.discount_price || p.price) >= min && (p.discount_price || p.price) <= max));
    }).finally(() => setLoading(false));
  }, [category, occasion, sort, q, min, max]);

  const update = (k, v) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v); else next.delete(k);
    setParams(next);
  };

  return (
    <div className="container-x py-16" data-testid="shop-page">
      <div className="text-center mb-12">
        <div className="overline">Boutique</div>
        <h1 className="font-heading text-5xl md:text-6xl mt-2">{category === "hamper" ? "Gift Hampers" : category === "bouquet" ? "Bouquets" : "Everything"}</h1>
      </div>

      <div className="grid md:grid-cols-[240px_1fr] gap-12">
        {/* Filters */}
        <aside className="space-y-8">
          <div>
            <div className="overline mb-3">Search</div>
            <div className="flex items-center border-b border-black/20 py-1">
              <input value={q} onChange={(e) => setQ(e.target.value)} data-testid="shop-search"
                placeholder="Search…" className="flex-1 bg-transparent py-2 text-sm focus:outline-none" />
              <Search className="w-4 h-4 text-ink-muted" />
            </div>
          </div>
          <div>
            <div className="overline mb-3">Category</div>
            <div className="space-y-2 text-sm">
              {[["", "All"], ["hamper", "Hampers"], ["bouquet", "Bouquets"]].map(([k, l]) => (
                <button key={k} onClick={() => update("category", k)}
                  data-testid={`filter-cat-${k || "all"}`}
                  className={`block w-full text-left transition-colors ${category === k ? "text-[#D4AF37]" : "text-ink-muted hover:text-black"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="overline mb-3">Occasion</div>
            <div className="space-y-2 text-sm">
              <button onClick={() => update("occasion", "")} className={`block ${!occasion ? "text-[#D4AF37]" : "text-ink-muted"}`}>All</button>
              {OCCASIONS.map((o) => (
                <button key={o} onClick={() => update("occasion", o)} data-testid={`filter-occ-${o.replace(/[^a-z]/gi,'').toLowerCase()}`}
                  className={`block w-full text-left transition-colors ${occasion === o ? "text-[#D4AF37]" : "text-ink-muted hover:text-black"}`}>
                  {o}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="overline mb-3">Sort</div>
            <select value={sort} onChange={(e) => update("sort", e.target.value)} data-testid="shop-sort"
              className="border border-black/20 text-sm py-2 px-3 w-full bg-white">
              <option value="newest">Newest</option>
              <option value="best_selling">Best Selling</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
        </aside>

        {/* Products */}
        <div>
          <div className="mb-6 text-sm text-ink-muted">{products.length} products</div>
          {loading ? <div>Loading…</div> :
           products.length === 0 ? <div className="text-center py-24 text-ink-muted">No products found</div> :
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          }
        </div>
      </div>
    </div>
  );
}
