import { Outlet, Link, NavLink, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { WeddingProvider, useWedding } from "@/context/WeddingContext";
import { Heart, LayoutDashboard, Users, Calculator, Store, Wallet, Mail, Bot, LogOut, ChevronDown, CalendarDays, MessageSquare, Hotel, BarChart3, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

const NAV = [
  { to: "/app", icon: LayoutDashboard, label: "Dashboard", end: true, id: "nav-dashboard" },
  { to: "/app/analytics", icon: BarChart3, label: "AI Analytics", id: "nav-analytics" },
  { to: "/app/agents", icon: Sparkles, label: "AI Agents", id: "nav-agents" },
  { to: "/app/guests", icon: Users, label: "Guests", id: "nav-guests" },
  { to: "/app/timeline", icon: CalendarDays, label: "Timeline", id: "nav-timeline" },
  { to: "/app/headcount", icon: Calculator, label: "Headcount", id: "nav-headcount" },
  { to: "/app/vendors", icon: Store, label: "Vendors", id: "nav-vendors" },
  { to: "/app/budget", icon: Wallet, label: "Budget", id: "nav-budget" },
  { to: "/app/accommodation", icon: Hotel, label: "Accommodation", id: "nav-accommodation" },
  { to: "/app/invitations", icon: Mail, label: "Invitations", id: "nav-invitations" },
  { to: "/app/hub", icon: MessageSquare, label: "Family Hub", id: "nav-hub" },
  { to: "/app/assistant", icon: Bot, label: "Shaadi Saheli", id: "nav-assistant" },
];

function Inner() {
  const { user, logout } = useAuth();
  const { active, weddings, selectWedding, loading } = useWedding();
  const nav = useNavigate();

  if (loading) return <div className="min-h-screen flex items-center justify-center text-stone-500">Loading…</div>;
  if (!loading && weddings.length === 0) return <Navigate to="/setup" replace />;

  return (
    <div className="min-h-screen flex bg-[#FAF9F6]">
      <aside className="w-64 border-r border-stone-200 bg-white p-6 flex flex-col sticky top-0 h-screen">
        <Link to="/app" className="flex items-center gap-2 mb-10" data-testid="app-logo">
          <Heart className="w-5 h-5 text-[#881337]" fill="#881337" />
          <span className="font-serif text-2xl">ShaadiOS</span>
        </Link>

        {active && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button data-testid="wedding-switcher" className="w-full text-left p-3 rounded-lg border border-stone-200 hover:bg-stone-50 transition mb-6">
                <p className="text-xs uppercase tracking-widest text-stone-400">Active wedding</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-serif text-lg truncate">{active.bride_name} & {active.groom_name}</span>
                  <ChevronDown className="w-4 h-4 text-stone-400" />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {weddings.map(w => (
                <DropdownMenuItem key={w.id} onClick={() => selectWedding(w)} data-testid={`wedding-option-${w.id}`}>
                  {w.bride_name} & {w.groom_name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => nav("/setup")} data-testid="add-wedding-option">+ Add new wedding</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <nav className="flex-1 space-y-1">
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.end} data-testid={n.id}
              className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${isActive ? "bg-[#881337] text-white" : "text-stone-700 hover:bg-stone-100"}`}>
              <n.icon className="w-4 h-4" strokeWidth={1.5} />
              {n.label}
            </NavLink>
          ))}
        </nav>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button data-testid="user-menu-trigger" className="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-100 mt-4">
              <div className="w-9 h-9 rounded-full bg-[#881337] text-white flex items-center justify-center font-medium text-sm">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-stone-500 truncate">{user?.email}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-52">
            <DropdownMenuItem onClick={() => { logout(); nav("/"); }} data-testid="logout-button">
              <LogOut className="w-4 h-4 mr-2" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </aside>

      <main className="flex-1 p-8 max-w-[1400px]">
        <Outlet />
      </main>
    </div>
  );
}

export default function DashboardLayout() {
  return <WeddingProvider><Inner /></WeddingProvider>;
}
