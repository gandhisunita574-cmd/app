import { useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";

const OCCASIONS = ["Birthday", "Anniversary", "Wedding", "Corporate", "Baby Shower", "Festivals", "Valentine's Day", "Mother's Day", "Father's Day", "Congratulations"];

export default function CustomOrder() {
  const [form, setForm] = useState({
    name: "", mobile: "", email: "", delivery_city: "", delivery_date: "",
    budget: "", occasion: "Birthday", description: "", notes: "",
  });
  const [images, setImages] = useState([]);
  const [submitted, setSubmitted] = useState(null);

  const upd = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onFiles = (e) => {
    const files = [...e.target.files].slice(0, 4);
    Promise.all(
      files.map(
        (f) =>
          new Promise((res) => {
            const r = new FileReader();
            r.onload = () => res(r.result);
            r.readAsDataURL(f);
          })
      )
    ).then(setImages);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/custom-orders", {
        ...form, budget: Number(form.budget), reference_images: images,
      });
      setSubmitted(data);
      toast.success("Request submitted!");
    } catch (err) {
      toast.error("Failed to submit");
    }
  };

  if (submitted) {
    return (
      <div className="container-x py-24 max-w-2xl text-center" data-testid="custom-order-success">
        <div className="overline text-[#D4AF37]">Received</div>
        <h1 className="font-heading text-5xl mt-4">Thank you.</h1>
        <p className="text-ink-muted mt-6">
          Your custom gifting request has been received. Ticket <span className="font-medium text-black">{submitted.ticket_no}</span>.
          Our curator will review your idea and reach out with a quotation within 24 hours.
        </p>
        <a href="/account?tab=custom" className="btn-outline mt-10 inline-block">View my requests</a>
      </div>
    );
  }

  return (
    <div className="container-x py-16 max-w-4xl" data-testid="custom-order-page">
      <div className="text-center mb-12">
        <div className="overline">Bespoke</div>
        <h1 className="font-heading text-5xl md:text-6xl mt-2">Design your dream gift</h1>
        <p className="text-ink-muted mt-6 max-w-xl mx-auto">
          Tell us your vision — a colour palette, a memory, a reference image — and we'll craft something one-of-a-kind, just for you.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
          <Field label="Your name" v={form.name} onChange={upd("name")} testid="co-name" required />
          <Field label="Mobile number" v={form.mobile} onChange={upd("mobile")} testid="co-mobile" required />
          <Field label="Email" type="email" v={form.email} onChange={upd("email")} testid="co-email" required />
          <Field label="Delivery city" v={form.delivery_city} onChange={upd("delivery_city")} testid="co-city" required />
          <Field label="Delivery date" type="date" v={form.delivery_date} onChange={upd("delivery_date")} testid="co-date" required />
          <Field label="Budget (₹)" type="number" v={form.budget} onChange={upd("budget")} testid="co-budget" required />
          <div>
            <label className="overline block mb-2">Occasion</label>
            <select value={form.occasion} onChange={upd("occasion")} data-testid="co-occasion"
              className="w-full border-b border-black/20 bg-transparent py-3 focus:outline-none focus:border-black">
              {OCCASIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="overline block mb-2">Describe your idea</label>
          <textarea value={form.description} onChange={upd("description")} required rows={5}
            data-testid="co-description"
            className="w-full border-b border-black/20 bg-transparent py-3 focus:outline-none focus:border-black"
            placeholder="Colours, contents, style, sentiments…" />
        </div>

        <div>
          <label className="overline block mb-2">Additional notes</label>
          <textarea value={form.notes} onChange={upd("notes")} rows={2}
            data-testid="co-notes"
            className="w-full border-b border-black/20 bg-transparent py-3 focus:outline-none focus:border-black" />
        </div>

        <div>
          <label className="overline block mb-3">Reference images (up to 4)</label>
          <label htmlFor="ref-upload" className="border-2 border-dashed border-black/20 flex flex-col items-center justify-center py-10 cursor-pointer hover:border-black transition-colors">
            <Upload className="w-8 h-8 text-ink-muted" />
            <div className="text-sm mt-2 text-ink-muted">Click to upload images</div>
            <input id="ref-upload" data-testid="co-upload" type="file" multiple accept="image/*" className="hidden" onChange={onFiles} />
          </label>
          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {images.map((src, i) => (
                <div key={i} className="relative aspect-square">
                  <img src={src} alt="ref" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 bg-white p-1"><X className="w-3 h-3"/></button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" data-testid="co-submit" className="btn-primary w-full">Submit Request</button>
      </form>
    </div>
  );
}

function Field({ label, v, onChange, type = "text", required, testid }) {
  return (
    <div>
      <label className="overline block mb-2">{label}</label>
      <input type={type} value={v} onChange={onChange} required={required} data-testid={testid}
        className="w-full border-b border-black/20 bg-transparent py-3 focus:outline-none focus:border-black" />
    </div>
  );
}
