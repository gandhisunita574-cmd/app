import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQ = [
  { q: "How long does delivery take?", a: "Most metro cities receive same-day delivery for orders placed before 2pm. Other locations receive delivery in 2–4 business days." },
  { q: "Can I request a fully custom hamper?", a: "Yes. Head to our Custom Order page, share your idea (and a reference image if you have one), and our curator will send a quotation within 24 hours." },
  { q: "What is your refund policy?", a: "Because our products are perishable and hand-crafted, we do not accept returns. However, if there is a quality issue, please contact us within 24 hours of delivery for a replacement or refund." },
  { q: "Can I cancel my order?", a: "Orders can be cancelled up to 4 hours before the scheduled delivery time. Custom orders are non-cancellable once the quotation is accepted and advance is paid." },
  { q: "What payment methods do you accept?", a: "We accept UPI, credit/debit cards, net banking, and Cash on Delivery in select cities." },
  { q: "Do you offer gift wrapping?", a: "Every hamper is elegantly packaged by default. You can add a signature gift-wrap and a handwritten note at checkout for ₹49." },
];

export default function FAQPage() {
  return (
    <div className="container-x py-16 max-w-3xl" data-testid="faq-page">
      <div className="text-center mb-12">
        <div className="overline">Support</div>
        <h1 className="font-heading text-5xl md:text-6xl mt-2">Frequently Asked</h1>
      </div>
      <Accordion type="single" collapsible className="w-full">
        {FAQ.map((f, i) => (
          <AccordionItem key={i} value={`i-${i}`} data-testid={`faq-${i}`}>
            <AccordionTrigger className="text-left font-heading text-xl">{f.q}</AccordionTrigger>
            <AccordionContent className="text-ink-muted leading-relaxed">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
