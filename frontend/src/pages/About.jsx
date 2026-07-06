export default function About() {
  return (
    <div data-testid="about-page">
      <section className="grid lg:grid-cols-2 min-h-[60vh]">
        <div className="flex flex-col justify-center container-x py-24">
          <div className="overline">Our Story</div>
          <h1 className="font-heading text-5xl md:text-6xl mt-4">Crafted with intention.<br/>Delivered with love.</h1>
          <p className="mt-8 text-ink-muted leading-relaxed max-w-md">
            Treasure Hampers began in a small studio with a single idea — that a gift should feel as considered as the moment it celebrates. Today, we hand-assemble every hamper and hand-arrange every bouquet, so nothing that leaves us is ever ordinary.
          </p>
        </div>
        <div>
          <img src="https://images.unsplash.com/photo-1710629357740-546115c6f75b?auto=format&fit=crop&w=1200&q=80" alt="florist" className="w-full h-full object-cover"/>
        </div>
      </section>

      <section className="py-24 bg-[#FAFAFA]">
        <div className="container-x grid md:grid-cols-3 gap-12">
          {[
            { t: "Our Mission", d: "To turn small moments into unforgettable ones through thoughtful, handcrafted gifting." },
            { t: "Quality Commitment", d: "Each hamper is inspected by a curator before it ships. If we won't gift it, we won't sell it." },
            { t: "Customer-First", d: "From bespoke requests to last-minute surprises, our team is here to make your gift perfect." },
          ].map((b) => (
            <div key={b.t}>
              <div className="text-[#D4AF37] text-4xl font-heading">✦</div>
              <div className="font-heading text-2xl mt-4">{b.t}</div>
              <p className="text-ink-muted mt-3">{b.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
