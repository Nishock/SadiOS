import { useEffect, useState } from "react";
import { useWedding } from "@/context/WeddingContext";
import { api } from "@/lib/api";
import { Link } from "react-router-dom";
import { Users, Wallet, Calculator, Calendar, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const fmtINR = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

export default function Dashboard() {
  const { active } = useWedding();
  const [stats, setStats] = useState({ guests: 0, confirmed: 0, spent: 0, budget: 0 });

  useEffect(() => {
    if (!active) return;
    Promise.all([
      api.get(`/weddings/${active.id}/guests`),
      api.get(`/weddings/${active.id}/budget/summary`),
    ]).then(([g, b]) => {
      const confirmed = g.data.filter(x => x.rsvp_status === "confirmed").length;
      setStats({ guests: g.data.length, confirmed, spent: b.data.total_spent, budget: b.data.total_budget });
    });
  }, [active]);

  if (!active) return null;
  const daysLeft = Math.max(0, Math.ceil((new Date(active.wedding_date) - new Date()) / 86400000));

  const cards = [
    { id: "stat-guests", icon: Users, label: "Guests invited", value: stats.guests, sub: `${stats.confirmed} confirmed`, link: "/app/guests" },
    { id: "stat-headcount", icon: Calculator, label: "AI Predicted", value: Math.round(stats.confirmed * 0.92 + (stats.guests - stats.confirmed) * 0.55), sub: "people will attend", link: "/app/headcount" },
    { id: "stat-budget", icon: Wallet, label: "Budget used", value: fmtINR(stats.spent), sub: `of ${fmtINR(stats.budget)}`, link: "/app/budget" },
    { id: "stat-days", icon: Calendar, label: "Days to go", value: daysLeft, sub: new Date(active.wedding_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) },
  ];

  return (
    <div className="space-y-10">
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}>
        <p className="uppercase tracking-[0.25em] text-xs font-semibold text-[#881337]">Wedding dashboard</p>
        <h1 className="font-serif text-5xl mt-2" data-testid="dashboard-couple-name">{active.bride_name} <span className="italic text-[#881337]">weds</span> {active.groom_name}</h1>
        <p className="text-stone-500 mt-2">{active.venue} · {active.city}</p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => {
          const Card = c.link ? Link : "div";
          return (
            <motion.div key={c.id} initial={{opacity:0, y:15}} animate={{opacity:1, y:0}} transition={{delay: i*0.07}}>
              <Card to={c.link || "#"} data-testid={c.id} className="block bg-white rounded-xl border border-stone-200 p-6 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                <c.icon className="w-5 h-5 text-[#881337]" strokeWidth={1.5} />
                <p className="text-xs uppercase tracking-widest text-stone-500 mt-4">{c.label}</p>
                <p className="font-serif text-3xl mt-1">{c.value}</p>
                <p className="text-xs text-stone-500 mt-1">{c.sub}</p>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-stone-200 rounded-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl">Quick actions</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              ["Add guests", "/app/guests", "Build your guest list and track RSVPs"],
              ["Run AI Headcount", "/app/headcount", "Predict attendance & food quantity"],
              ["Browse vendors", "/app/vendors", "Find photographers, caterers and more"],
              ["Create invitation", "/app/invitations", "Send beautiful e-invites with RSVP"],
            ].map(([t, to, d]) => (
              <Link key={to} to={to} data-testid={`quick-${to.split('/').pop()}`} className="group p-5 rounded-lg border border-stone-200 hover:border-[#881337] transition">
                <p className="font-serif text-xl">{t}</p>
                <p className="text-sm text-stone-500 mt-1">{d}</p>
                <ArrowRight className="w-4 h-4 mt-3 text-stone-400 group-hover:text-[#881337] group-hover:translate-x-1 transition" />
              </Link>
            ))}
          </div>
        </div>
        <div className="bg-stone-900 text-white rounded-xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <img src="https://images.unsplash.com/photo-1705475388142-a2700c4caeb5?crop=entropy&cs=srgb&fm=jpg&w=600&q=85" className="w-full h-full object-cover" alt=""/>
            <div className="absolute inset-0 bg-stone-900/70" />
          </div>
          <div className="relative">
            <p className="uppercase tracking-widest text-xs text-[#FCD34D]">Shaadi Saheli</p>
            <h3 className="font-serif text-3xl mt-2">Need wedding advice?</h3>
            <p className="text-stone-300 text-sm mt-2">Ask anything — budget, vendors, food quantity, traditions.</p>
            <Link to="/app/assistant" data-testid="dashboard-assistant-cta" className="inline-flex items-center gap-2 mt-6 bg-white text-stone-900 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-stone-100">
              Chat with Saheli <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
