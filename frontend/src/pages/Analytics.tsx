import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import { api } from "@/services/api";
import { useCampaignStore } from "@/store/campaignStore";
import { Header } from "@/components/layout/Header";

const MOCK_TREND = [
  { month: "Jan", campaigns: 0, completed: 0 },
  { month: "Feb", campaigns: 1, completed: 0 },
  { month: "Mar", campaigns: 2, completed: 1 },
  { month: "Apr", campaigns: 3, completed: 2 },
  { month: "May", campaigns: 4, completed: 3 },
  { month: "Jun", campaigns: 6, completed: 4 },
];

const PIE_COLORS = ["#6366f1", "#22c55e", "#ef4444", "#eab308", "#ec4899"];

export function Analytics() {
  const { setCampaigns, campaigns } = useCampaignStore();

  const { data } = useQuery({
    queryKey: ["campaigns"],
    queryFn: api.campaigns.list,
  });

  useEffect(() => { if (data) setCampaigns(data); }, [data]);

  const statusDistribution = Object.entries(
    campaigns.reduce((acc, c) => {
      const key = ["COMPLETED","FAILED","CREATED"].includes(c.status)
        ? c.status
        : "RUNNING";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const industryDistribution = Object.entries(
    campaigns.reduce((acc, c) => {
      acc[c.industry] = (acc[c.industry] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, count]) => ({ name, count }));

  const avgConfidence = (() => {
    const scores: number[] = [];
    campaigns.forEach((c) => {
      if (c.agent_outputs) {
        Object.values(c.agent_outputs).forEach((o) => {
          if (o?.confidence_score) scores.push(o.confidence_score);
        });
      }
    });
    return scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length * 100).toFixed(1) : "—";
  })();

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="Analytics" />
      <div className="p-6 space-y-6">

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Campaigns",  value: campaigns.length.toString(),       color: "text-indigo-400" },
            { label: "Success Rate",      value: campaigns.length ? `${((campaigns.filter(c=>c.status==="COMPLETED").length/campaigns.length)*100).toFixed(0)}%` : "—", color: "text-green-400" },
            { label: "Avg Confidence",    value: `${avgConfidence}%`,               color: "text-purple-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass p-5 rounded-xl">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">{label}</p>
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-5 rounded-xl"
          >
            <h3 className="text-sm font-semibold text-white mb-4">Campaign Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={MOCK_TREND}>
                <defs>
                  <linearGradient id="colorCampaigns" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#475569" fontSize={11} />
                <YAxis stroke="#475569" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Area type="monotone" dataKey="campaigns" stroke="#6366f1" fill="url(#colorCampaigns)" strokeWidth={2} />
                <Area type="monotone" dataKey="completed" stroke="#22c55e" fill="url(#colorCompleted)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass p-5 rounded-xl"
          >
            <h3 className="text-sm font-semibold text-white mb-4">Status Distribution</h3>
            {statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                    {statusDistribution.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend
                    formatter={(value) => <span style={{ color: "#94a3b8", fontSize: 11 }}>{value}</span>}
                  />
                  <Tooltip
                    contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-600 text-sm">No data</div>
            )}
          </motion.div>
        </div>

        {industryDistribution.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass p-5 rounded-xl"
          >
            <h3 className="text-sm font-semibold text-white mb-4">Campaigns by Industry</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={industryDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#475569" fontSize={11} />
                <YAxis stroke="#475569" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>
    </div>
  );
}
