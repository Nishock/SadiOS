import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, Users, Calculator, Store, Wallet, Mail, Bot, ArrowRight, Heart, Check } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const FEATURES = [
  { icon: Users, title: "Guest Management", desc: "Family-wise grouping, RSVP tracking, plus-ones — all in one elegant register." },
  { icon: Calculator, title: "AI Headcount Predictor", desc: "Know exactly how many will show up. Food, seating, parking — calculated to the plate." },
  { icon: Store, title: "Vendor Marketplace", desc: "Hand-picked photographers, caterers, decorators and makeup artists across India." },
  { icon: Wallet, title: "Smart Budget", desc: "Track every rupee. Get alerts before you overspend on saree or sound system." },
  { icon: Mail, title: "Digital Invitations", desc: "Beautiful e-invites with one-click WhatsApp share and live RSVP collection." },
  { icon: Bot, title: "Shaadi Saheli AI", desc: "Your 24/7 wedding sakhi. Ask in Hindi, English ya Hinglish." },
];

export default function Landing() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/public/contact", { name, email, message });
      toast.success("Thank you! Your message has been sent successfully.");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900">
      {/* NAV */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-stone-200/60">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" data-testid="landing-logo">
            <Heart className="w-5 h-5 text-[#881337]" fill="#881337" />
            <span className="font-serif text-2xl tracking-tight">ShaadiOS</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-stone-700">
            <a href="#features" className="link-underline">Features</a>
            <a href="#how" className="link-underline">How it works</a>
            <a href="#pricing" className="link-underline">Pricing</a>
            <a href="#contact" className="link-underline">Contact Us</a>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/app" data-testid="home-emergent-link">
                <Button className="bg-[#881337] hover:bg-[#6f0f2d] text-white rounded-full px-5">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login" data-testid="nav-login-link" className="text-sm font-medium text-stone-700 hover:text-[#881337] mr-2">Log in</Link>
                <Link to="/signup" data-testid="nav-signup-button">
                  <Button className="bg-stone-900 hover:bg-stone-800 text-white rounded-full px-5">Start free</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-28 grid lg:grid-cols-12 gap-10 items-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="lg:col-span-7">
            <p className="uppercase tracking-[0.25em] text-xs font-semibold text-[#881337] mb-6">AI-Powered Wedding Intelligence Platform</p>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tight text-stone-900">
              Plan the<br/>
              <span className="italic text-[#881337]">shaadi</span> of <br/>
              your dreams.
            </h1>
            <p className="mt-7 text-lg text-stone-600 max-w-xl leading-relaxed">
              From the first RSVP to the last laddoo — ShaadiOS brings every Indian wedding under one beautifully crafted dashboard. Six specialist AI agents. Smart analytics. Real intelligence — not just a chatbot.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              {user ? (
                <Link to="/app" data-testid="hero-get-started-button">
                  <Button className="bg-[#881337] hover:bg-[#6f0f2d] text-white rounded-full px-7 py-6 text-base">
                    Go to Dashboard <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <Link to="/signup" data-testid="hero-get-started-button">
                  <Button className="bg-[#881337] hover:bg-[#6f0f2d] text-white rounded-full px-7 py-6 text-base">
                    Start planning free <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              )}
              <a href="#features">
                <Button variant="outline" className="rounded-full px-7 py-6 text-base border-stone-300">
                  Explore features
                </Button>
              </a>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-stone-500">
              <div className="flex -space-x-2">
                {["#881337","#F59E0B","#A3B18A","#FCD34D"].map((c,i)=>(
                  <span key={i} className="w-8 h-8 rounded-full border-2 border-white" style={{background:c}}/>
                ))}
              </div>
              <span>Trusted by families across 28+ Indian cities</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.15 }} className="lg:col-span-5 relative">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
              <img src="https://images.unsplash.com/photo-1665960213508-48f07086d49c?crop=entropy&cs=srgb&fm=jpg&w=900&q=85" alt="Indian wedding couple" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 via-transparent to-transparent" />
            </div>
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.6 }} className="absolute -bottom-6 -left-8 bg-white p-5 rounded-xl shadow-xl border border-stone-100 w-64">
              <p className="text-xs uppercase tracking-widest text-stone-500">AI Predicted</p>
              <p className="font-serif text-3xl mt-1">487 <span className="text-base text-stone-500">guests</span></p>
              <p className="text-xs text-[#A3B18A] mt-1">92% confidence • food for 510</p>
            </motion.div>
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.8 }} className="absolute -top-4 -right-6 bg-[#FCD34D] p-4 rounded-xl shadow-lg w-44">
              <p className="text-xs uppercase tracking-widest text-stone-800">Budget saved</p>
              <p className="font-serif text-2xl text-stone-900">₹ 2.4 L</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="bg-[#F2EFE9] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl">
            <p className="uppercase tracking-[0.25em] text-xs font-semibold text-[#881337] mb-4">Everything you need</p>
            <h2 className="font-serif text-4xl sm:text-5xl tracking-tight">One platform.<br/>Every wedding decision.</h2>
          </div>
          <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="bg-white p-8 rounded-xl border border-stone-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-[#881337]/10 flex items-center justify-center mb-5">
                  <f.icon className="w-5 h-5 text-[#881337]" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-2xl mb-2">{f.title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="py-24 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <img src="https://images.unsplash.com/photo-1705475388142-a2700c4caeb5?crop=entropy&cs=srgb&fm=jpg&w=900&q=85" alt="Marigold" className="rounded-xl aspect-[4/5] object-cover" />
          </div>
          <div className="lg:col-span-7">
            <p className="uppercase tracking-[0.25em] text-xs font-semibold text-[#881337] mb-4">How it works</p>
            <h2 className="font-serif text-4xl sm:text-5xl tracking-tight mb-10">Three steps. <br/>Stress-free shaadi.</h2>
            <div className="space-y-8">
              {[
                ["01","Create your wedding","Bride, groom, date, venue, budget — sab kuch ek jagah."],
                ["02","Add guests & vendors","Import your guest list, pick caterers and photographers from our marketplace."],
                ["03","Let AI handle the math","Shaadi Saheli predicts attendance, food, seating and keeps your budget in check."],
              ].map(([n, t, d]) => (
                <div key={n} className="flex gap-6 border-t border-stone-200 pt-6">
                  <span className="font-serif text-3xl text-[#881337]">{n}</span>
                  <div>
                    <h3 className="font-serif text-2xl mb-1">{t}</h3>
                    <p className="text-stone-600">{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="bg-stone-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="uppercase tracking-[0.25em] text-xs font-semibold text-[#FCD34D] mb-4">Pricing</p>
            <h2 className="font-serif text-4xl sm:text-5xl tracking-tight">Pay for what you celebrate.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Free", price: "₹0", desc: "Perfect to start planning", features: ["1 wedding","Up to 100 guests","Basic budget tracker","Vendor browsing"] },
              { name: "Premium", price: "₹4,999", popular: true, desc: "Most loved by families", features: ["Unlimited guests","AI Headcount & Catering","AI Wedding Assistant","Digital invitations","Priority vendor support"] },
              { name: "Enterprise", price: "Custom", desc: "For wedding planners", features: ["Multiple weddings","Team management","White-label invitations","Dedicated success manager"] },
            ].map(p => (
              <div key={p.name} className={`rounded-2xl p-8 border ${p.popular ? "bg-white text-stone-900 border-transparent shadow-2xl scale-[1.03]" : "border-stone-700 bg-stone-800"}`}>
                {p.popular && <span className="inline-block text-xs uppercase tracking-widest bg-[#881337] text-white px-3 py-1 rounded-full mb-4">Most Popular</span>}
                <h3 className="font-serif text-3xl">{p.name}</h3>
                <p className={`mt-1 text-sm ${p.popular ? "text-stone-500" : "text-stone-400"}`}>{p.desc}</p>
                <p className="font-serif text-5xl mt-6">{p.price}<span className="text-base font-sans text-stone-400"> /wedding</span></p>
                <ul className="mt-6 space-y-3 text-sm">
                  {p.features.map(f => (
                    <li key={f} className="flex items-center gap-2"><Check className="w-4 h-4 text-[#A3B18A]" />{f}</li>
                  ))}
                </ul>
                <Link to={user ? "/app" : "/signup"} className="block mt-8">
                  <Button data-testid={`pricing-${p.name.toLowerCase()}-button`} className={`w-full rounded-full ${p.popular ? "bg-stone-900 hover:bg-stone-800 text-white" : "bg-white text-stone-900 hover:bg-stone-100"}`}>
                    {user ? "Go to Dashboard" : `Choose ${p.name}`}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-24 bg-[#FAF9F6] border-t border-stone-200">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="uppercase tracking-[0.25em] text-xs font-semibold text-[#881337] mb-4">Contact Us</p>
            <h2 className="font-serif text-4xl sm:text-5xl tracking-tight">Let's craft your celebration.</h2>
            <p className="text-stone-600 mt-4">Have questions about pricing, features, or custom integrations? Drop us a line and our team will get back to you.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 sm:p-10 rounded-2xl border border-stone-200 shadow-sm">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-stone-700">Your Name</label>
                <input
                  type="text"
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#881337]/20 focus:border-[#881337] transition"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-stone-700">Email Address</label>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rahul@example.com"
                  className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#881337]/20 focus:border-[#881337] transition"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium text-stone-700">Message</label>
              <textarea
                id="message"
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we help you plan your dream wedding?"
                className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#881337]/20 focus:border-[#881337] transition resize-none"
              />
            </div>
            <Button type="submit" disabled={submitting} className="w-full bg-[#881337] hover:bg-[#6f0f2d] text-white rounded-full py-6 text-base font-medium transition">
              {submitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#FAF9F6] border-t border-stone-200 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2"><Heart className="w-4 h-4 text-[#881337]" fill="#881337" /><span className="font-serif text-xl">ShaadiOS</span></div>
          <p className="text-sm text-stone-500">Designed & Developed by <span className="text-stone-900 font-medium">Jigyansh Kumar</span> · © 2026</p>
        </div>
      </footer>
    </div>
  );
}
