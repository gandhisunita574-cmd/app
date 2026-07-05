import { useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";

export default function Contact() {
  const [f, setF] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const upd = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/contact", f);
      setF({ name: "", email: "", phone: "", subject: "", message: "" });
      toast.success("Message sent");
    } catch { toast.error("Failed"); }
  };
  return (
    <div className="container-x py-16" data-testid="contact-page">
      <div className="text-center mb-12">
        <div className="overline">Talk to us</div>
        <h1 className="font-heading text-5xl md:text-6xl mt-2">We'd love to hear from you</h1>
      </div>
      <div className="grid lg:grid-cols-2 gap-16 max-w-5xl mx-auto">
        <div className="space-y-8">
          <Info icon={Phone} label="Call" v="+91 99999 99999" testid="contact-phone"/>
          <Info icon={MessageCircle} label="WhatsApp" v="Chat with us" testid="contact-wa"/>
          <Info icon={Mail} label="Email" v="hello@hamperstore.com" testid="contact-email"/>
          <Info icon={MapPin} label="Studio" v="42 Curator's Lane, Mumbai 400001"/>
          <a href="https://wa.me/919999999999" data-testid="wa-fab" className="btn-gold inline-block">
            <MessageCircle className="w-4 h-4 inline mr-2"/> WhatsApp us
          </a>
        </div>
        <form onSubmit={submit} className="space-y-6" data-testid="contact-form">
          {["name","email","phone","subject"].map((k)=>(
            <input key={k} required={k!=="phone"} placeholder={k[0].toUpperCase()+k.slice(1)} value={f[k]} onChange={upd(k)}
              data-testid={`contact-${k}`}
              className="w-full border-b border-black/20 bg-transparent py-3 focus:outline-none focus:border-black"/>
          ))}
          <textarea required rows={5} placeholder="Message" value={f.message} onChange={upd("message")}
            data-testid="contact-message"
            className="w-full border-b border-black/20 bg-transparent py-3 focus:outline-none focus:border-black"/>
          <button className="btn-primary w-full" data-testid="contact-submit">Send Message</button>
        </form>
      </div>
    </div>
  );
}
function Info({ icon: Icon, label, v, testid }) {
  return (
    <div className="flex gap-4" data-testid={testid}>
      <Icon className="w-5 h-5 text-[#D4AF37] mt-1" strokeWidth={1.4}/>
      <div><div className="overline">{label}</div><div className="mt-1">{v}</div></div>
    </div>
  );
}
