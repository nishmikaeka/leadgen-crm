"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Zap, TrendingUp, Users, Target } from "lucide-react";

const FEATURES = [
  { icon: TrendingUp, label: "Pipeline Analytics" },
  { icon: Users, label: "Lead Management" },
  { icon: Target, label: "Deal Tracking" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      const payload = response.data?.data;
      if (!payload?.user || !payload?.accessToken)
        throw new Error("Invalid response from server");
      setAuth(payload.user, payload.accessToken);
      toast.success(`Welcome back, ${payload.user.name}!`);
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel – Navy branding ──────────────────── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ backgroundColor: "var(--sidebar-bg)" }}
      >
        {/* Decorative glow blobs */}
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ backgroundColor: "var(--sidebar-active)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-8 blur-3xl pointer-events-none"
          style={{ backgroundColor: "var(--sidebar-active)" }}
        />

        {/* Brand */}
        <div className="relative flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "var(--sidebar-active)" }}
          >
            <Zap size={18} className="text-white" fill="white" />
          </div>
          <span
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            LeadGen
            <span style={{ color: "var(--sidebar-active)" }}>.</span>
          </span>
        </div>

        {/* Hero copy */}
        <div className="relative space-y-6">
          <h2
            className="text-4xl font-bold text-white leading-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Close more deals,
            <br />
            <span style={{ color: "var(--sidebar-active)" }}>faster.</span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-xs">
            A professional CRM built for modern sales teams. Manage every lead
            from first touch to closed deal.
          </p>
          <ul className="space-y-3">
            {FEATURES.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-3 text-slate-300 text-sm"
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "rgba(249,115,22,0.15)" }}
                >
                  <Icon size={14} style={{ color: "var(--sidebar-active)" }} />
                </div>
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="relative text-slate-600 text-xs">
          &copy; {new Date().getFullYear()} LeadGen CRM
        </p>
      </div>

      {/* ── Right panel – Login form ────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-sm space-y-7">
          {/* Mobile brand */}
          <div className="flex items-center gap-2 lg:hidden">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "var(--sidebar-active)" }}
            >
              <Zap size={16} className="text-white" fill="white" />
            </div>
            <span
              className="text-xl font-bold"
              style={{
                fontFamily: "var(--font-heading)",
                color: "var(--sidebar-bg)",
              }}
            >
              LeadGen
              <span style={{ color: "var(--sidebar-active)" }}>.</span>
            </span>
          </div>

          <div className="space-y-1">
            <h1
              className="text-2xl font-bold text-slate-900"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Sign in to your account
            </h1>
            <p className="text-slate-500 text-sm">
              Enter your credentials to continue
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-slate-700 text-sm font-medium"
              >
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 border-slate-200 focus:ring-orange-300"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-slate-700 text-sm font-medium"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 border-slate-200 focus:ring-orange-300"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-10 font-semibold text-white cursor-pointer transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--sidebar-active)" }}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-slate-400">
            Don&apos;t have an account?{" "}
            <span
              className="font-medium cursor-pointer"
              style={{ color: "var(--sidebar-active)" }}
            >
              Contact your admin
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
