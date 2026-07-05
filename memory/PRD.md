# HamperStore — Premium Gift Hamper & Bouquet E-commerce

## Original Problem Statement
Build a premium, elegant, luxury e-commerce website (white/black/gold aesthetic) for gift hampers and bouquets, with a full storefront, a custom-order quotation workflow, and an admin dashboard.

## User Choices (from ask_human)
- Scope: Full storefront + custom order + admin
- Auth: JWT email/password (users) + JWT admin login
- Payments: MOCKED (UI only)
- Emails: Skipped for MVP (in-app only)
- Brand: HamperStore (AI/placeholder logo)

## Architecture
- **Backend**: FastAPI + MongoDB (motor). All routes under `/api`. JWT auth via httpOnly cookie + Bearer fallback. bcrypt password hashing.
- **Frontend**: React + Tailwind + Shadcn/UI. Cormorant Garamond (serif headings) + Outfit (body). Gold #D4AF37 on white/black.
- **Payments**: MOCKED — orders auto-set to `payment_status="paid"`.

## Personas
- **Customer**: browses shop, requests custom gifts, tracks orders, wishlists.
- **Admin**: manages products/coupons, changes order status, sends quotations for custom requests.

## Implemented (Feb 2026)
- Home (hero, featured, why-us, occasions, best sellers, testimonials, new arrivals, IG grid, newsletter)
- Shop (category/occasion/sort/search filters)
- Product Detail (gallery, quantity, add-to-cart, buy-now, pincode checker, reviews, wishlist, share)
- Custom Order form (with reference image upload as base64)
- User account (register/login/orders/custom-requests/wishlist/accept-quote)
- Cart + Checkout (address, coupon WELCOME10, gift wrap, mock payment)
- Admin dashboard (stats, products CRUD, orders status, custom-order quotation workflow, customers list, coupons CRUD)
- About / Contact / FAQ pages
- Newsletter + Contact form persistence

## Prioritized Backlog (P0/P1/P2)
### P1 — Next enhancements
- Real payment gateway (Stripe / Razorpay) — replace mock
- Real email notifications (Resend/SendGrid) for order events + quotation
- Analytics dashboard: sales chart via Recharts (backend endpoint ready)
- Product image upload (currently URL-based; add upload to object storage)
- Google Maps embed on Contact page

### P2 — Nice-to-have
- Social login (Google via Emergent Auth)
- Live chat widget
- Frequently bought together / recently viewed
- SEO sitemap.xml + schema markup
- Banner management, review moderation in admin

## Test Credentials
- Admin: `admin@hamperstore.com` / `Admin@1234`
- Coupon: `WELCOME10` (10% off)
