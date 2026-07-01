import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart } from "lucide-react";
import { toast } from "sonner";

export default function Signup() {
  const nav = useNavigate();
  const { register } = useAuth();
  const [data, setData] = useState({ name: "", email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(data);
      toast.success("Welcome to SHAADIOS!");
      nav("/setup");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Signup failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#FAF9F6]">
      <div className="flex items-center justify-center p-8 order-2 lg:order-1">
        <form onSubmit={submit} className="w-full max-w-md space-y-5">
          <div>
            <p className="uppercase tracking-[0.25em] text-xs font-semibold text-[#881337]">Create account</p>
            <h1 className="font-serif text-4xl mt-2">Start your shaadi journey</h1>
            <p className="text-stone-500 mt-2 text-sm">Free forever. No credit card needed.</p>
          </div>
          <div className="space-y-2"><Label>Full name</Label><Input data-testid="signup-name-input" value={data.name} onChange={e=>setData({...data,name:e.target.value})} required/></div>
          <div className="space-y-2"><Label>Email</Label><Input data-testid="signup-email-input" type="email" value={data.email} onChange={e=>setData({...data,email:e.target.value})} required/></div>
          <div className="space-y-2"><Label>Mobile (optional)</Label><Input data-testid="signup-phone-input" value={data.phone} onChange={e=>setData({...data,phone:e.target.value})}/></div>
          <div className="space-y-2"><Label>Password</Label><Input data-testid="signup-password-input" type="password" minLength={6} value={data.password} onChange={e=>setData({...data,password:e.target.value})} required/></div>
          <Button type="submit" disabled={loading} data-testid="signup-submit-button" className="w-full bg-[#881337] hover:bg-[#6f0f2d] text-white rounded-full py-6">
            {loading ? "Creating account..." : "Create account"}
          </Button>
          <p className="text-center text-sm text-stone-500">
            Already have an account? <Link to="/login" className="text-[#881337] font-medium" data-testid="signup-login-link">Log in</Link>
          </p>
        </form>
      </div>
      <div className="hidden lg:block relative order-1 lg:order-2">
        <img src="https://images.unsplash.com/photo-1665960213508-48f07086d49c?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent" />
        <Link to="/" className="absolute top-8 right-8 flex items-center gap-2 text-white">
          <Heart className="w-5 h-5" fill="#fff" />
          <span className="font-serif text-2xl">SHAADIOS</span>
        </Link>
      </div>
    </div>
  );
}
