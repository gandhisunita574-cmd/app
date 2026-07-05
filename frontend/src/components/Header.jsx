import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, User, Menu, Search, Heart, X } from "lucide-react";
import { useState } from "react";

const links = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/shop?category=hamper", label: "Hampers" },
  { to: "/shop?category=bouquet", label: "Bouquets" },
  { to: "/custom-order", label: "Custom" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Header() {
  const { user, logout } = useAuth();
  const { count, setOpen } = useCart();
  const nav = useNavigate();
  const [mobile, setMobile] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-black/5">
      <div className="container-x flex items-center justify-between h-20">
        <button
          className="lg:hidden"
          onClick={() => setMobile(true)}
          data-testid="menu-open-btn"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/" className="flex items-center gap-2" data-testid="brand-logo">
          <span className="font-heading text-3xl tracking-tight">Hamper</span>
          <span className="font-heading text-3xl italic text-[#D4AF37]">Store</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <NavLink
              key={l.label}
              to={l.to}
              className={({ isActive }) =>
                `text-sm tracking-wide transition-colors hover:text-[#D4AF37] ${isActive ? "text-black" : "text-ink-muted"}`
              }
              data-testid={`nav-${l.label.toLowerCase()}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <button onClick={() => nav("/shop")} data-testid="search-btn" aria-label="Search">
            <Search className="w-5 h-5" />
          </button>
          {user && user !== false ? (
            <button onClick={() => nav("/account")} data-testid="account-btn" aria-label="Account">
              <User className="w-5 h-5" />
            </button>
          ) : (
            <Link to="/login" data-testid="login-link" className="hidden sm:inline text-sm">Sign in</Link>
          )}
          <button onClick={() => nav("/account?tab=wishlist")} data-testid="wishlist-btn" aria-label="Wishlist" className="hidden sm:inline">
            <Heart className="w-5 h-5" />
          </button>
          <button
            onClick={() => setOpen(true)}
            data-testid="cart-button"
            className="relative"
            aria-label="Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-2 -right-3 text-[10px] bg-[#D4AF37] text-white rounded-full w-4 h-4 flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobile && (
        <div className="fixed inset-0 z-50 bg-white lg:hidden animate-fade-in">
          <div className="flex items-center justify-between p-6 border-b">
            <span className="font-heading text-2xl">Menu</span>
            <button onClick={() => setMobile(false)} data-testid="menu-close-btn"><X /></button>
          </div>
          <div className="flex flex-col p-8 gap-6">
            {links.map((l) => (
              <Link key={l.label} to={l.to} onClick={() => setMobile(false)}
                className="text-xl font-heading" data-testid={`mnav-${l.label.toLowerCase()}`}>
                {l.label}
              </Link>
            ))}
            {user && user !== false ? (
              <button onClick={() => { logout(); setMobile(false); }} className="text-left text-sm text-ink-muted" data-testid="mobile-logout">Sign out</button>
            ) : (
              <Link to="/login" className="text-sm" onClick={() => setMobile(false)}>Sign in</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
