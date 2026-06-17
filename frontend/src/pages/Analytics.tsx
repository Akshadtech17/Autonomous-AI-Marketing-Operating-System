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
import { TrendingUp, Award, Zap } from "lucide-react";

const MOCK_TREND = [
  { month: "Jan", campaigns: 0, completed: 0 },
  { month: "Feb", campaigns: 1, completed: 0 },
  { month: "Mar", campaigns: 2, completed: 1 },
  { month: "Apr", campaigns: 3, completed: 2 },
  { month: "May", campaigns: 4, completed: 3 },
  { month: "Jun", campaigns: 6, completed: 4 },
];

const PIE_COLORS = ["#6366f1", "#10b981", "#f43f5e", "#f59e0b", "#f472b6"];

const tooltipStyle = {
  contentStyle: {
    background: "rgba(8,13,26,0.95)",
    border: "1px solid rgba(99,102,241,0.2)",
    borderRadius: "12px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    fontSize: "12px",
    fontFamily: "'Space Grotesk', sans-serif",
  },
  labelStyle: { color: "#e2e8f0", fontWeight: 600 },
  itemStyle: { color: "#94a3b8" },
};

function KPICard({ label, value, color, icon: Icon, delay }: { label: string; value: string; color: string; icon: any; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(12,19,37,0.9) 0%, rgba(8,13,26,0.95) 100%)",
        border: `1px solid ${color}18`,
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = `${color}40`;
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${color}20`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = `${color}18`;
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)";
      }}
    >
      <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full" style={{ background: `radial-gradient(circle, ${color}15 0%, transparent 70%)` }} />
      <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${color}50, transparent)` }} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#475569", fontFamily: "'Space Grotesk', sans-serif" }}>{label}</p>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
            <Icon className="w-3.5 h-3.5" style={{ color }} />
          </div>
        </div>
        <p className="text-[36px] font-bold leading-none" style={{ fontFamily: "'Syne', sans-serif", color }}>{value}</p>
      </div>
    </motion.div>
  );
}

function ChartCard({ title, children, delay }: { title: string; children: React.ReactNode; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(12,19,37,0.9) 0%, rgba(8,13,26,0.95) 100%)",
        border: "1px solid rgba(255,255,255,0.05)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}
    >
      <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <h3 className="text-[13px] font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </motion.div>
  );
}

export function Analytics() {
  const { setCampaigns, campaigns } = useCampaignStore();

  const { data } = useQuery({
    queryKey: ["campaigns"],
    queryFn: api.campaigns.list,
  });

  useEffect(() => { if (data) setCampaigns(data); }, [data]);

  const statusDistribution = Object.entries(
    campaigns.reduce((acc, c) => {
      const key = ["COMPLETED","FAILED","CREATED"].includes(c.status) ? c.status : "RUNNING";
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
          if ((o as any)?.confidence_score) scores.push((o as any).confidence_score);
        });
      }
    });
    return scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length * 100).toFixed(1) : "—";
  })();

  const successRate = campaigns.length
    ? `${((campaigns.filter((c) => c.status === "COMPLETED").length / campaigns.length) * 100).toFixed(0)}%`
    : "—";

  return (
    <div className="flex-1 overflow-y-auto relative z-10">
      <Header title="Analytics" />

      <div className="p-4 md:p-6 space-y-4 md:space-y-5">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KPICard label="Total Campaigns"  value={campaigns.length.toString()} color="#6366f1" icon={Zap}       delay={0}    />
          <KPICard label="Success Rate"     value={successRate}                 color="#10b981" icon={Award}     delay={0.06} />
          <KPICard label="Avg Confidence"   value={`${avgConfidence}%`}         color="#a78bfa" icon={TrendingUp}delay={0.12} />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title="Campaign Growth Trend" delay={0.18}>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={MOCK_TREND}>
                <defs>
                  <linearGradient id="gradCampaigns" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}   />
                  </linearGradient>
                  <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" stroke="#334155" fontSize={11} tick={{ fontFamily: "'Space Grotesk', sans-serif", fill: "#475569" }} />
                <YAxis stroke="#334155" fontSize={11} tick={{ fontFamily: "'Space Grotesk', sans-serif", fill: "#475569" }} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="campaigns" stroke="#6366f1" fill="url(#gradCampaigns)" strokeWidth={2} dot={{ fill: "#6366f1", strokeWidth: 0, r: 3 }} />
                <Area type="monotone" dataKey="completed" stroke="#10b981" fill="url(#gradCompleted)"  strokeWidth={2} dot={{ fill: "#10b981", strokeWidth: 0, r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Campaign Status Distribution" delay={0.22}>
            {statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%" cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {statusDistribution.map((_, i) => (
                      <Cell
                        key={i}
                        fill={PIE_COLORS[i % PIE_COLORS.length]}
                        stroke="rgba(5,8,17,0.8)"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Legend
                    iconSize={8}
                    iconType="circle"
                    formatter={(v) => <span style={{ color: "#64748b", fontSize: 11, fontFamily: "'Space Grotesk', sans-serif" }}>{v}</span>}
                  />
                  <Tooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-[13px] text-slate-700">No data yet</div>
            )}
          </ChartCard>
        </div>

        {/* Industry breakdown */}
        {industryDistribution.length > 0 && (
          <ChartCard title="Campaigns by Industry" delay={0.28}>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={industryDistribution} barSize={28}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#8b5cf6" stopOpacity={1}   />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" stroke="#334155" fontSize={10} tick={{ fontFamily: "'Space Grotesk', sans-serif", fill: "#475569" }} />
                <YAxis stroke="#334155" fontSize={10} tick={{ fontFamily: "'Space Grotesk', sans-serif", fill: "#475569" }} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="count" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Agent confidence breakdown */}
        {campaigns.some((c) => c.agent_outputs && Object.keys(c.agent_outputs).length > 0) && (
          <ChartCard title="Agent Confidence Scores" delay={0.32}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: "CEO",       key: "ceo_agent",               color: "#a78bfa", icon: "👑" },
                { name: "Research",  key: "research_agent",           color: "#22d3ee", icon: "🔬" },
                { name: "SEO",       key: "seo_agent",                color: "#10b981", icon: "🎯" },
                { name: "Content",   key: "content_agent",            color: "#f59e0b", icon: "✍️" },
                { name: "Social",    key: "social_agent",             color: "#f472b6", icon: "📱" },
                { name: "Analytics", key: "analytics_agent",          color: "#fb923c", icon: "📊" },
                { name: "Creative",  key: "creative_director_agent",  color: "#f43f5e", icon: "🎨" },
                { name: "Report",    key: "report_agent",             color: "#6366f1", icon: "📋" },
              ].map(({ name, key, color, icon }) => {
                const scores = campaigns
                  .map((c) => (c.agent_outputs?.[key] as any)?.confidence_score)
                  .filter(Boolean) as number[];
                const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

                return (
                  <div
                    key={key}
                    className="p-3 rounded-xl"
                    style={{
                      background: `${color}08`,
                      border: `1px solid ${color}20`,
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-sm">{icon}</span>
                      <span className="text-[10px] font-bold" style={{ color, fontFamily: "'Space Grotesk', sans-serif" }}>{name}</span>
                    </div>
                    <p className="text-[20px] font-bold leading-none mb-1.5" style={{ fontFamily: "'Syne', sans-serif", color }}>
                      {scores.length ? `${(avg * 100).toFixed(0)}%` : "—"}
                    </p>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${avg * 100}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        )}
      </div>
    </div>
  );
}
