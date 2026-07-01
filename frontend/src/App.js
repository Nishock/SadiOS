import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Toaster } from "sonner";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";
import Guests from "@/pages/Guests";
import Headcount from "@/pages/Headcount";
import Vendors from "@/pages/Vendors";
import Budget from "@/pages/Budget";
import Invitations from "@/pages/Invitations";
import Assistant from "@/pages/Assistant";
import PublicInvite from "@/pages/PublicInvite";
import WeddingSetup from "@/pages/WeddingSetup";
import Timeline from "@/pages/Timeline";
import Hub from "@/pages/Hub";
import Accommodation from "@/pages/Accommodation";
import Analytics from "@/pages/Analytics";
import Agents from "@/pages/Agents";
import DashboardLayout from "@/components/DashboardLayout";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-stone-500">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" richColors />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/invite/:slug" element={<PublicInvite />} />
            <Route path="/setup" element={<Protected><WeddingSetup /></Protected>} />
            <Route path="/app" element={<Protected><DashboardLayout /></Protected>}>
              <Route index element={<Dashboard />} />
              <Route path="guests" element={<Guests />} />
              <Route path="headcount" element={<Headcount />} />
              <Route path="vendors" element={<Vendors />} />
              <Route path="budget" element={<Budget />} />
              <Route path="invitations" element={<Invitations />} />
              <Route path="timeline" element={<Timeline />} />
              <Route path="hub" element={<Hub />} />
              <Route path="accommodation" element={<Accommodation />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="agents" element={<Agents />} />
              <Route path="assistant" element={<Assistant />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
