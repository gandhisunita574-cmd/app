import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { toast } from "sonner";
import { ArrowRight, Sparkles, ShieldCheck, Truck, Gift } from "lucide-react";

const OCCASIONS = [
  { name: "Birthday", img: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80" },
  { name: "Anniversary", img: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80" },
  { name: "Wedding", img: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80" },
  { name: "Corporate", img: "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=800&q=80" },
  { name: "Baby Shower", img: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80" },
  { name: "Festivals", img: "https://images.unsplash.com/photo-1608755728617-aefab37d2edd?auto=format&fit=crop&w=800&q=80" },
];

const TESTIMONIALS = [
  { q: "The most beautifully packaged hamper I've ever received. Truly luxurious.", a: "Aditi S., Mumbai" },
  { q: "Custom bouquet for my mother's birthday — she cried. Thank you for making it special.", a: "Rohan K., Bangalore" },
  { q: "Corporate gifting done right. Our clients were genuinely impressed.", a: "Priya M., Delhi" },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [best, setBest] = useState([]);
  const [newArr, setNewArr] = useState([]);

  useEffect(() => {
    api.get("/products?featured=true&limit=8").then((r) => setFeatured(r.data)).catch(() => {});
    api.get("/products?best_seller=true&limit=4").then((r) => setBest(r.data)).catch(() => {});
    api.get("/products?new_arrival=true&limit=4").then((r) => setNewArr(r.data)).catch(() => {});
  }, []);

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="grid lg:grid-cols-2 min-h-[80vh]">
          <div className="flex flex-col justify-center container-x py-24 lg:py-32">
            <div className="overline mb-6" data-testid="hero-tagline">The Art of Gifting</div>
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight">
              Gifts that <em className="text-[#D4AF37] not-italic font-light" >feel</em><br />
              intentional.
            </h1>
            <p className="mt-8 text-ink-muted max-w-md leading-relaxed">
              Hand-curated luxury hampers and hand-arranged bouquets, delivered with the kind of care that turns moments into memories.
            </p>
            <div className="mt-12 flex flex-wrap gap-4">
              <Link to="/shop" className="btn-primary" data-testid="hero-shop-btn">
                Shop Now <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link to="/custom-order" className="btn-outline" data-testid="hero-custom-btn">
                Customize Your Gift
              </Link>
            </div>
            <div className="flex items-center gap-8 mt-16 text-xs uppercase tracking-widest text-ink-muted">
              <div>Fastest delivery, promised</div>
              <div className="w-px h-4 bg-black/20" />
              <div>100% Hand-crafted</div>
            </div>
          </div>
          <div className="relative bg-[#FAFAFA] min-h-[400px]">
            <img
              src="https://images.pexels.com/photos/20699855/pexels-photo-20699855.jpeg?auto=compress&cs=tinysrgb&h=900&w=1200"
              alt="Luxury hamper"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute bottom-8 right-8 bg-white p-6 max-w-xs shadow-xl">
              <div className="overline text-[#D4AF37]">Signature Collection</div>
              <div className="font-heading text-2xl mt-2">Golden Radiance</div>
              <div className="text-sm text-ink-muted mt-1">From ₹2,999</div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="py-20 bg-[#FAFAFA]">
        <div className="container-x grid md:grid-cols-4 gap-12">
          {[
            { icon: Sparkles, t: "Hand-crafted", d: "Every hamper is assembled by hand." },
            { icon: ShieldCheck, t: "Premium quality", d: "Only the finest curated ingredients." },
            { icon: Truck, t: "Fastest delivery", d: "Thoughtfully packed and rushed to your door." },
            { icon: Gift, t: "Custom gifting", d: "Design a hamper to match your vision." },
          ].map((f, i) => (
            <div key={i} className="text-center">
              <f.icon className="w-8 h-8 mx-auto text-[#D4AF37]" strokeWidth={1.4} />
              <div className="font-heading text-xl mt-4">{f.t}</div>
              <div className="text-sm text-ink-muted mt-2">{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="container-x py-24">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="overline">Featured</div>
            <h2 className="font-heading text-4xl md:text-5xl mt-2">Signature Collection</h2>
          </div>
          <Link to="/shop" className="hidden md:inline-flex items-center text-sm link-gold" data-testid="view-all-featured">
            View all <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* CUSTOMIZE BANNER */}
      <section className="relative">
        <div className="grid lg:grid-cols-2">
          <div className="bg-black text-white flex items-center px-8 md:px-20 py-24">
            <div>
              <div className="overline text-[#D4AF37]">Bespoke</div>
              <h2 className="font-heading text-4xl md:text-5xl mt-4 leading-tight">
                Have something<br />in mind?
              </h2>
              <p className="mt-6 text-white/70 max-w-md">
                Share your idea or a reference image. Our curator will design a one-of-a-kind hamper or bouquet just for you.
              </p>
              <Link to="/custom-order" className="btn-gold mt-10" data-testid="banner-custom-btn">
                Request a Custom Gift
              </Link>
            </div>
          </div>
          <div className="min-h-[400px]">
            <img
              src="https://images.unsplash.com/photo-1782038522691-7faf943aa95e?auto=format&fit=crop&w=1000&q=80"
              alt="Custom"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* OCCASIONS */}
      <section className="container-x py-24">
        <div className="text-center mb-16">
          <div className="overline">Shop by occasion</div>
          <h2 className="font-heading text-4xl md:text-5xl mt-2">A gift for every moment</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {OCCASIONS.map((o) => (
            <Link key={o.name} to={`/shop?occasion=${encodeURIComponent(o.name)}`} className="group relative aspect-square overflow-hidden" data-testid={`occasion-${o.name.toLowerCase().replace(/[^a-z]/g,'')}`}>
              <img src={o.img} alt={o.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center text-white font-heading text-xl">{o.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-[#FAFAFA]">
        <div className="container-x">
          <div className="text-center mb-16">
            <div className="overline">How it works</div>
            <h2 className="font-heading text-4xl md:text-5xl mt-2">Effortless gifting in four steps</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-12">
            {["Choose or Customize", "We Craft it", "Delivered in Style", "They Smile"].map((t, i) => (
              <div key={t} className="text-center">
                <div className="font-heading text-6xl text-[#D4AF37]">0{i + 1}</div>
                <div className="font-heading text-xl mt-4">{t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="container-x py-24">
        <div className="mb-12"><div className="overline">Best selling</div><h2 className="font-heading text-4xl md:text-5xl mt-2">Customer favourites</h2></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {best.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-black text-white">
        <div className="container-x">
          <div className="overline text-[#D4AF37] text-center">Kind words</div>
          <div className="mt-12 grid md:grid-cols-3 gap-12">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="text-center">
                <div className="text-[#D4AF37] mb-4">★ ★ ★ ★ ★</div>
                <p className="font-heading text-2xl leading-snug italic">"{t.q}"</p>
                <div className="mt-6 overline text-white/50">{t.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="container-x py-24">
        <div className="mb-12"><div className="overline">Just in</div><h2 className="font-heading text-4xl md:text-5xl mt-2">New Arrivals</h2></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {newArr.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* INSTAGRAM */}
      <section className="container-x py-16">
        <div className="text-center mb-10"><div className="overline">@TreasureHampers</div><h2 className="font-heading text-3xl md:text-4xl mt-2">Follow the moments</h2></div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {[
            "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1608755728617-aefab37d2edd?auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1674620213535-9b2a2553ef40?auto=format&fit=crop&w=400&q=80",
          ].map((src, i) => (
            <div key={i} className="aspect-square overflow-hidden">
              <img src={src} alt="ig" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
