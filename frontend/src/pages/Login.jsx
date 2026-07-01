import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      nav("/app");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#FAF9F6]">
      <div className="hidden lg:block relative">
        <img src="https://images.unsplash.com/photo-1735052712464-9d24b69be5f5?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 to-transparent" />
        <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-white" data-testid="login-logo-link">
          <Heart className="w-5 h-5" fill="#fff" />
          <span className="font-serif text-2xl">SHAADIOS</span>
        </Link>
        <div className="absolute bottom-12 left-8 right-8 text-white">
          <p className="font-serif text-4xl leading-tight">"Best decision we made before the wedding."</p>
          <p className="text-sm mt-3 opacity-80">— Priya & Arjun, Delhi</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-8">
        <form onSubmit={submit} className="w-full max-w-md space-y-6">
          <div>
            <p className="uppercase tracking-[0.25em] text-xs font-semibold text-[#881337]">Welcome back</p>
            <h1 className="font-serif text-4xl mt-2">Log in to SHAADIOS</h1>
            <p className="text-stone-500 mt-2 text-sm">Continue planning your beautiful day.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" data-testid="login-email-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pw">Password</Label>
            <Input id="pw" data-testid="login-password-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" disabled={loading} data-testid="login-submit-button" className="w-full bg-[#881337] hover:bg-[#6f0f2d] text-white rounded-full py-6">
            {loading ? "Logging in..." : "Log in"}
          </Button>
          <p className="text-center text-sm text-stone-500">
            New here? <Link to="/signup" className="text-[#881337] font-medium" data-testid="login-signup-link">Create account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
