import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { formatError } from "@/lib/api";
import { toast } from "sonner";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const submit = async (e) => {
    e.preventDefault(); setErr("");
    try {
      await register(f.name, f.email, f.password);
      toast.success("Account created");
      nav("/account");
    } catch (e) { setErr(formatError(e)); }
  };
  return (
    <div className="container-x py-24 max-w-md" data-testid="register-page">
      <div className="text-center mb-10">
        <div className="overline">Join us</div>
        <h1 className="font-heading text-5xl mt-2">Create account</h1>
      </div>
      <form onSubmit={submit} className="space-y-6">
        <input required placeholder="Full name" value={f.name} onChange={(e)=>setF({...f, name:e.target.value})}
          data-testid="reg-name"
          className="w-full border-b border-black/20 bg-transparent py-3 focus:outline-none focus:border-black"/>
        <input required type="email" placeholder="Email" value={f.email} onChange={(e)=>setF({...f, email:e.target.value})}
          data-testid="reg-email"
          className="w-full border-b border-black/20 bg-transparent py-3 focus:outline-none focus:border-black"/>
        <input required type="password" placeholder="Password (min 6 chars)" value={f.password} onChange={(e)=>setF({...f, password:e.target.value})}
          data-testid="reg-password"
          className="w-full border-b border-black/20 bg-transparent py-3 focus:outline-none focus:border-black"/>
        {err && <div className="text-sm text-red-700" data-testid="reg-error">{err}</div>}
        <button data-testid="reg-submit" className="btn-primary w-full">Create account</button>
      </form>
      <div className="text-center mt-8 text-sm text-ink-muted">
        Already have an account? <Link to="/login" className="link-gold">Sign in</Link>
      </div>
    </div>
  );
}
