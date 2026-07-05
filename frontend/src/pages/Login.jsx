import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { formatError } from "@/lib/api";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const d = await login(email, password);
      toast.success("Welcome back");
      nav(d.role === "admin" ? "/admin" : "/account");
    } catch (e) {
      setErr(formatError(e));
    }
  };
  return (
    <div className="container-x py-24 max-w-md" data-testid="login-page">
      <div className="text-center mb-10">
        <div className="overline">Welcome back</div>
        <h1 className="font-heading text-5xl mt-2">Sign in</h1>
      </div>
      <form onSubmit={submit} className="space-y-6">
        <input required type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)}
          data-testid="login-email"
          className="w-full border-b border-black/20 bg-transparent py-3 focus:outline-none focus:border-black"/>
        <input required type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)}
          data-testid="login-password"
          className="w-full border-b border-black/20 bg-transparent py-3 focus:outline-none focus:border-black"/>
        {err && <div className="text-sm text-red-700" data-testid="login-error">{err}</div>}
        <button data-testid="login-submit" className="btn-primary w-full">Sign in</button>
      </form>
      <div className="text-center mt-8 text-sm text-ink-muted">
        New here? <Link to="/register" className="link-gold" data-testid="link-register">Create an account</Link>
      </div>
    </div>
  );
}
