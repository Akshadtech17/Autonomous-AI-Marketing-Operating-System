import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/services/api";
import { useCampaignStore } from "@/store/campaignStore";
import { useGlobalWebSocket } from "@/hooks/useWebSocket";
import { Header } from "@/components/layout/Header";
import { EventFeed } from "@/components/live/EventFeed";
import { SystemVisualization } from "@/three/SystemVisualization";
import { AgentStatusCard } from "@/components/campaign/AgentStatusCard";
import { Activity, Radio } from "lucide-react";

const AGENT_NAMES = [
  "ceo_agent","research_agent","seo_agent","content_agent",
  "social_agent","analytics_agent","creative_director_agent","report_agent",
];

export function LiveMonitor() {
  const { setCampaigns, campaigns, agentProgress } = useCampaignStore();
  useGlobalWebSocket();

  const { data } = useQuery({
    queryKey: ["campaigns"],
    queryFn: api.campaigns.list,
    refetchInterval: 3000,
  });

  useEffect(() => { if (data) setCampaigns(data); }, [data]);

  const active = campaigns.filter((c) => !["COMPLETED","FAILED","CREATED"].includes(c.status));

  return (
    <div className="flex-1 overflow-y-auto relative z-10">
      <Header title="Live Monitor" />

      <div className="p-4 md:p-6 space-y-4 md:space-y-5">

        {/* Top stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Active Campaigns", value: active.length,                                                    color: "#6366f1" },
            { label: "Completed",        value: campaigns.filter((c) => c.status === "COMPLETED").length,         color: "#10b981" },
            { label: "Total Agents",     value: AGENT_NAMES.length,                                               color: "#a78bfa" },
          ].map(({ label, value, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl p-5 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(12,19,37,0.9) 0%, rgba(8,13,26,0.95) 100%)",
                border: `1px solid ${color}18`,
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              }}
            >
              <div className="absolute -right-3 -top-3 w-16 h-16 rounded-full" style={{ background: `radial-gradient(circle, ${color}18 0%, transparent 70%)` }} />
              <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${color}50, transparent)` }} />
              <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: "#475569", fontFamily: "'Space Grotesk', sans-serif" }}>{label}</p>
              <p className="text-[36px] font-bold leading-none" style={{ fontFamily: "'Syne', sans-serif", color }}>{value}</p>
            </motion.div>
          ))}
        </div>

        {/* 3D + event feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-2 rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(12,19,37,0.9) 0%, rgba(8,13,26,0.95) 100%)",
              border: "1px solid rgba(99,102,241,0.1)",
            }}
          >
            <div className="flex items-center gap-2 px-5 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" style={{ boxShadow: "0 0 6px #6366f1" }} />
              <span className="text-[11px] font-bold tracking-[0.1em] uppercase text-indigo-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Agent Network · 3D View
              </span>
            </div>
            <SystemVisualization />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <EventFeed />
          </motion.div>
        </div>

        {/* Agent status grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(10,16,32,0.9) 0%, rgba(6,10,20,0.95) 100%)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div className="flex items-center gap-2 px-5 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <Activity className="w-3.5 h-3.5" style={{ color: "#6366f1" }} />
            <span className="text-[12px] font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>Agent Status Grid</span>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[10px] text-slate-600">Real-time</span>
            </div>
          </div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {AGENT_NAMES.map((agentName, i) => {
              const progress = agentProgress[agentName];
              return (
                <motion.div
                  key={agentName}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 + i * 0.04 }}
                >
                  <AgentStatusCard
                    agentName={agentName}
                    state={progress?.state ?? "PENDING"}
                    progress={progress?.progress ?? 0}
                    message={progress?.message ?? "Idle"}
                    confidenceScore={progress?.confidence_score}
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Running campaigns */}
        {active.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(10,16,32,0.9) 0%, rgba(6,10,20,0.95) 100%)",
              border: "1px solid rgba(99,102,241,0.12)",
              boxShadow: "0 0 30px rgba(99,102,241,0.08)",
            }}
          >
            <div className="flex items-center gap-2 px-5 py-3.5" style={{ borderBottom: "1px solid rgba(99,102,241,0.08)" }}>
              <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span className="text-[12px] font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>Running Campaigns</span>
              <span
                className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8", fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {active.length}
              </span>
            </div>
            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.03)" }}>
              {active.map((c, i) => {
                const statusColors: Record<string, string> = {
                  PLANNING: "#f59e0b", RUNNING_RESEARCH: "#22d3ee", RUNNING_SEO: "#10b981",
                  RUNNING_CONTENT: "#a78bfa", RUNNING_SOCIAL: "#f472b6", RUNNING_ANALYTICS: "#fb923c",
                  REVIEW: "#22d3ee", REPORT_GENERATION: "#6366f1",
                };
                const sc = statusColors[c.status] ?? "#6366f1";
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 px-5 py-4"
                  >
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold" style={{ background: `${sc}15`, color: sc, fontFamily: "'Syne', sans-serif" }}>
                      {c.business_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-white truncate" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{c.business_name}</p>
                      <p className="text-[11px] text-slate-600 truncate mt-0.5">{c.industry}</p>
                    </div>
                    <div
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold"
                      style={{
                        background: `${sc}12`,
                        color: sc,
                        border: `1px solid ${sc}30`,
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: sc }} />
                      {c.status.replace(/_/g, " ")}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
