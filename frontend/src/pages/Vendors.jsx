import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useWedding } from "@/context/WeddingContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Search } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const CATS = ["All","Photographer","Caterer","Decorator","Makeup Artist","DJ"];

export default function Vendors() {
  const { active } = useWedding();
  const [vendors, setVendors] = useState([]);
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");

  useEffect(() => {
    const params = cat === "All" ? {} : { category: cat };
    api.get("/vendors", { params }).then(r => setVendors(r.data));
  }, [cat]);

  const book = async (v) => {
    if (!active) return;
    await api.post("/vendors/book", { wedding_id: active.id, vendor_id: v.id });
    toast.success(`Booking request sent to ${v.name}`);
  };

  const filtered = vendors.filter(v =>
    !q || v.name.toLowerCase().includes(q.toLowerCase()) || v.city.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <p className="uppercase tracking-[0.25em] text-xs font-semibold text-[#881337]">Vendor Marketplace</p>
        <h1 className="font-serif text-4xl mt-2">The handpicked <span className="italic text-[#881337]">crew</span></h1>
        <p className="text-stone-500 mt-2">India's finest wedding vendors, vetted by SHAADIOS.</p>
      </div>

      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {CATS.map(c => (
            <button key={c} onClick={()=>setCat(c)} data-testid={`cat-${c.replace(/ /g,'-').toLowerCase()}`}
              className={`px-4 py-2 rounded-full text-sm transition ${cat === c ? "bg-stone-900 text-white" : "bg-white border border-stone-200 hover:border-stone-400"}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400"/>
          <Input data-testid="vendor-search" placeholder="Search by name or city…" value={q} onChange={e=>setQ(e.target.value)} className="pl-9 w-64"/>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((v, i) => (
          <motion.div key={v.id} initial={{opacity:0, y:15}} animate={{opacity:1, y:0}} transition={{delay: i*0.04}}
            className="bg-white rounded-xl overflow-hidden border border-stone-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300" data-testid={`vendor-card-${v.id}`}>
            <div className="aspect-[4/3] overflow-hidden bg-stone-100">
              <img src={v.image} alt={v.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"/>
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-serif text-xl">{v.name}</h3>
                <Badge variant="outline" className="text-xs">{v.category}</Badge>
              </div>
              <div className="flex items-center gap-3 text-sm text-stone-500 mb-3">
                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]"/>{v.rating} ({v.reviews})</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/>{v.city}</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-4">
                {(v.tags || []).slice(0, 3).map(t => <span key={t} className="text-xs bg-stone-100 px-2 py-0.5 rounded-full text-stone-600">{t}</span>)}
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-stone-400">Starting</p>
                  <p className="font-serif text-2xl">₹{Number(v.price_from).toLocaleString("en-IN")}</p>
                </div>
                <Button onClick={()=>book(v)} data-testid={`book-vendor-${v.id}`} className="bg-[#881337] hover:bg-[#6f0f2d] text-white rounded-full">Request booking</Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
