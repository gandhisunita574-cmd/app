import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter, MessageCircle } from "lucide-react";
import { useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";

export default function Footer() {
  const [email, setEmail] = useState("");
  const subscribe = async (e) => {
    e.preventDefault();
    try {
      await api.post("/newsletter", { email });
      toast.success("Subscribed!");
      setEmail("");
    } catch {
      toast.error("Try again");
    }
  };
  return (
    <footer className="bg-black text-white mt-24">
      <div className="container-x py-20 grid md:grid-cols-4 gap-12">
        <div>
          <div className="font-heading text-3xl">Hamper<span className="italic text-[#D4AF37]">Store</span></div>
          <p className="mt-6 text-white/60 text-sm leading-relaxed">
            Curated luxury gifts, hand-arranged bouquets, and bespoke hampers delivered with intention.
          </p>
          <div className="flex gap-4 mt-8">
            <a href="#" data-testid="social-ig"><Instagram className="w-4 h-4 text-white/60 hover:text-[#D4AF37]"/></a>
            <a href="#" data-testid="social-fb"><Facebook className="w-4 h-4 text-white/60 hover:text-[#D4AF37]"/></a>
            <a href="#" data-testid="social-tw"><Twitter className="w-4 h-4 text-white/60 hover:text-[#D4AF37]"/></a>
            <a href="https://wa.me/919999999999" data-testid="social-wa"><MessageCircle className="w-4 h-4 text-white/60 hover:text-[#D4AF37]"/></a>
          </div>
        </div>

        <div>
          <div className="overline text-white/50 mb-6">Shop</div>
          <ul className="space-y-3 text-sm text-white/70">
            <li><Link to="/shop?category=hamper" data-testid="foot-hampers">Gift Hampers</Link></li>
            <li><Link to="/shop?category=bouquet" data-testid="foot-bouquets">Bouquets</Link></li>
            <li><Link to="/custom-order" data-testid="foot-custom">Custom Orders</Link></li>
            <li><Link to="/shop?new_arrival=true">New Arrivals</Link></li>
          </ul>
        </div>

        <div>
          <div className="overline text-white/50 mb-6">Help</div>
          <ul className="space-y-3 text-sm text-white/70">
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/account">My Account</Link></li>
          </ul>
        </div>

        <div>
          <div className="overline text-white/50 mb-6">Newsletter</div>
          <p className="text-sm text-white/60 mb-4">Receive early access to new collections & seasonal offers.</p>
          <form onSubmit={subscribe} className="flex gap-2">
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              data-testid="newsletter-input"
              className="bg-transparent border-b border-white/30 py-2 flex-1 text-sm focus:outline-none focus:border-[#D4AF37]"
            />
            <button data-testid="newsletter-submit" className="text-[#D4AF37] text-sm tracking-wider uppercase">Join</button>
          </form>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-white/40">
        © {new Date().getFullYear()} HamperStore · Handcrafted with care
      </div>
    </footer>
  );
}
