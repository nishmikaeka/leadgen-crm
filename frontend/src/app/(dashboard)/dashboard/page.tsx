"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  Users,
  DollarSign,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";

// Verdana Health chart palette
const VH_COLORS = ["#F97316", "#0F172A", "#A5B4FC", "#6366F1", "#F59E0B"];

const DATE_RANGES = [
  { label: "All Time", value: "ALL" },
  { label: "Today", value: "TODAY" },
  { label: "Yesterday", value: "YESTERDAY" },
  { label: "Last 7 Days", value: "LAST_7" },
  { label: "Last 30 Days", value: "LAST_30" },
  { label: "This Year", value: "THIS_YEAR" },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("ALL");

  const fetchStats = async () => {
    setLoading(true);
    try {
      let startDate = "";
      let endDate = "";
      const now = new Date();

      switch (range) {
        case "TODAY":
          startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
          break;
        case "YESTERDAY":
          const yesterday = new Date(now);
          yesterday.setDate(now.getDate() - 1);
          startDate = new Date(yesterday.setHours(0, 0, 0, 0)).toISOString();
          endDate = new Date(yesterday.setHours(23, 59, 59, 999)).toISOString();
          break;
        case "LAST_7":
          const last7 = new Date(now);
          last7.setDate(now.getDate() - 7);
          startDate = last7.toISOString();
          break;
        case "LAST_30":
          const last30 = new Date(now);
          last30.setDate(now.getDate() - 30);
          startDate = last30.toISOString();
          break;
        case "THIS_YEAR":
          startDate = new Date(now.getFullYear(), 0, 1).toISOString();
          break;
      }

      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const r = await api.get("/dashboard/stats", { params });
      setStats(r.data.data);
    } catch {
      toast.error("Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  const { _hasHydrated, user } = useAuthStore();

  useEffect(() => {
    if (_hasHydrated && user) {
      fetchStats();
    }
  }, [range, _hasHydrated, user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-7 w-40 bg-slate-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-56 bg-slate-100 rounded animate-pulse" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-slate-100 rounded-xl animate-pulse border-l-4 border-transparent"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const barData = [
    { name: "New", count: stats.newLeads, fill: "#F97316" },
    { name: "Qualified", count: stats.qualifiedLeads, fill: "#A5B4FC" },
    { name: "Won", count: stats.wonLeads, fill: "#0F172A" },
    { name: "Lost", count: stats.lostLeads, fill: "#EF4444" },
  ];

  const pieData = Object.entries(stats.sourceDistribution || {}).map(
    ([name, value]) => ({ name, value }),
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold text-slate-900"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Overview of your sales pipeline
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-slate-400" />
          <Select value={range} onValueChange={(v) => setRange(v ?? "ALL")}>
            <SelectTrigger className="w-[160px] bg-white border-slate-200">
              <SelectValue placeholder="Select Range" />
            </SelectTrigger>
            <SelectContent align="end" side="bottom">
              {DATE_RANGES.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stat cards (Status counts) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          title="Total Leads"
          value={stats.totalLeads}
          icon={Users}
          accentColor="border-indigo-400"
          iconBg="bg-indigo-50"
          iconColor="text-indigo-500"
        />
        <StatCard
          title="New"
          value={stats.newLeads}
          icon={Clock}
          accentColor="border-orange-400"
          iconBg="bg-orange-50"
          iconColor="text-orange-500"
        />
        <StatCard
          title="Qualified"
          value={stats.qualifiedLeads}
          icon={TrendingUp}
          accentColor="border-emerald-400"
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Won"
          value={stats.wonLeads}
          icon={CheckCircle2}
          accentColor="border-green-500"
          iconBg="bg-green-50"
          iconColor="text-green-600"
        />
        <StatCard
          title="Lost"
          value={stats.lostLeads}
          icon={XCircle}
          accentColor="border-red-400"
          iconBg="bg-red-50"
          iconColor="text-red-500"
        />
      </div>

      {/* Financial Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-white rounded-xl shadow-sm border-l-4 border-green-500 p-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
              Total Won Value
            </p>
            <p
              className="text-3xl font-bold text-slate-900 mt-1"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              ${(stats.totalValueOfWonDeals || 0).toLocaleString()}
            </p>
          </div>
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-50"
          >
            <CheckCircle2 size={24} className="text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border-l-4 border-orange-400 p-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
              Total Pipeline Value
            </p>
            <p
              className="text-3xl font-bold text-slate-900 mt-1"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              ${(stats.totalEstimatedDealValue || 0).toLocaleString()}
            </p>
          </div>
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center bg-orange-50"
          >
            <DollarSign size={24} className="text-orange-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h2
            className="text-sm font-semibold text-slate-800 mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Leads by Status
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barSize={30}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#F1F5F9"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
                contentStyle={{
                  borderRadius: 8,
                  fontSize: 12,
                  border: "1px solid #E2E8F0",
                }}
              />
              <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h2
            className="text-sm font-semibold text-slate-800 mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Lead Sources
          </h2>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-[220px] text-slate-400 text-sm">
              No source data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={VH_COLORS[i % VH_COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    fontSize: 12,
                    border: "1px solid #E2E8F0",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
