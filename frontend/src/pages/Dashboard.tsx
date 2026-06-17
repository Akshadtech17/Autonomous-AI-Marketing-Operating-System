import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, TrendingUp, Zap, CheckCircle, XCircle, ArrowRight, Activity } from "lucide-react";
import { api } from "@/services/api";
import { useCampaignStore } from "@/store/campaignStore";
import { useGlobalWebSocket } from "@/hooks/useWebSocket";
import { Header } from "@/components/layout/Header";
import { SystemVisualization } from "@/three/SystemVisualization";
import { EventFeed } from "@/components/live/EventFeed";
import { formatDistanceToNow } from "date-fns";

const STATUS_BADGE: Record<string, { bg: string; text: string; dot: string }> = {
  COMPLETED:         { bg: "rgba(16,185,129,0.1)",  text: "#10b981", dot: "#10b981"  },
  FAILED:            { bg: "rgba(244,63,94,0.1)",   text: "#f43f5e", dot: "#f43f5e"  },
  PLANNING:          { bg: "rgba(245,158,11,0.1)",  text: "#f59e0b", dot: "#f59e0b"  },
  RUNNING_RESEARCH:  { bg: "rgba(34,211,238,0.1)",  text: "#22d3ee", dot: "#22d3ee"  },
  RUNNING_SEO:       { bg: "rgba(16,185,129,0.1)",  text: "#10b981", dot: "#10b981"  },
  RUNNING_CONTENT:   { bg: "rgba(167,139,250,0.1)", text: "#a78bfa", dot: "#a78bfa"  },
  RUNNING_SOCIAL:    { bg: "rgba(244,114,182,0.1)", text: "#f472b6", dot: "#f472b6"  },
  RUNNING_ANALYTICS: { bg: "rgba(245,158,11,0.1)",  text: "#f59e0b", dot: "#f59e0b"  },
  REVIEW:            { bg: "rgba(34,211,238,0.1)",  text: "#22d3ee", dot: "#22d3ee"  },
  REPORT_GENERATION: { bg: "rgba(99,102,241,0.1)",  text: "#818cf8", dot: "#6366f1"  },
  CREATED:           { bg: "rgba(71,85,105,0.15)",  text: "#64748b", dot: "#475569"  },
};

const STATS_CONFIG = [
  { key: "total",     label: "Total",     icon: Zap,         color: "#6366f1", glow: "rgba(99,102,241,0.3)"  },
  { key: "completed", label: "Completed", icon: CheckCircle, color: "#10b981", glow: "rgba(16,185,129,0.3)"  },
  { key: "running",   label: "Active",    icon: Activity,    color: "#22d3ee", glow: "rgba(34,211,238,0.3)"  },
  { key: "failed",    label: "Failed",    icon: XCircle,     color: "#f43f5e", glow: "rgba(244,63,94,0.3)"   },
];

function StatCard({ label, value, icon: Icon, color, glow, delay }: {
  label: string; value: number; icon: any; color: string; glow: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="relative overflow-hidden rounded-2xl p-5 group cursor-default"
      style={{
        background: "linear-gradient(135deg, rgba(12,19,37,0.9) 0%, rgba(8,13,26,0.95) 100%)",
        border: `1px solid ${color}1a`,
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = `${color}40`;
        (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 40px rgba(0,0,0,0.5), 0 0 20px ${glow}`;
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = `${color}1a`;
        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(0,0,0,0.4)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      }}
    >
      {/* Background orb */}
      <div
        className="absolute -right-4 -top-4 w-20 h-20 rounded-full transition-all duration-300 group-hover:scale-125"
        style={{ background: `radial-gradient(circle, ${color}18 0%, transparent 70%)` }}
      />
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: "#475569", fontFamily: "'Space Grotesk', sans-serif" }}>
            {label}
          </p>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
            <Icon className="w-3.5 h-3.5" style={{ color }} />
          </div>
        </div>
        <motion.p
          key={value}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="text-4xl font-bold leading-none"
          style={{ fontFamily: "'Syne', sans-serif", color }}
        >
          {value}
        </motion.p>
      </div>
    </motion.div>
  );
}

export function Dashboard() {
  const { setCampaigns, campaigns } = useCampaignStore();
  useGlobalWebSocket();

  const { data } = useQuery({
    queryKey: ["campaigns"],
    queryFn: api.campaigns.list,
    refetchInterval: 5000,
  });

  useEffect(() => { if (data) setCampaigns(data); }, [data]);

  const stats = {
    total:     campaigns.length,
    completed: campaigns.filter((c) => c.status === "COMPLETED").length,
    running:   campaigns.filter((c) => !["COMPLETED","FAILED","CREATED"].includes(c.status)).length,
    failed:    campaigns.filter((c) => c.status === "FAILED").length,
  };

  return (
    <div className="flex-1 overflow-y-auto relative z-10">
      <Header title="Dashboard" />

      <div className="p-4 md:p-6 space-y-4 md:space-y-5">
        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STATS_CONFIG.map(({ key, label, icon, color, glow }, i) => (
            <StatCard
              key={key}
              label={label}
              value={stats[key as keyof typeof stats]}
              icon={icon}
              color={color}
              glow={glow}
              delay={i * 0.06}
            />
          ))}
        </div>

        {/* 3D vis + event feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(12,19,37,0.9) 0%, rgba(8,13,26,0.95) 100%)",
              border: "1px solid rgba(99,102,241,0.1)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
            }}
          >
            <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#6366f1", boxShadow: "0 0 6px #6366f1" }} />
                <span className="text-[11px] font-bold tracking-[0.12em] uppercase" style={{ color: "#6366f1", fontFamily: "'Space Grotesk', sans-serif" }}>
                  Agent Network
                </span>
              </div>
              <span className="text-[10px] text-slate-600">Live</span>
            </div>
            <SystemVisualization />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
          >
            <EventFeed />
          </motion.div>
        </div>

        {/* Recent campaigns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(12,19,37,0.9) 0%, rgba(8,13,26,0.95) 100%)",
            border: "1px solid rgba(255,255,255,0.05)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
          }}
        >
          {/* Table header */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div className="flex items-center gap-2.5">
              <TrendingUp className="w-4 h-4" style={{ color: "#6366f1" }} />
              <h2 className="text-[13px] font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                Recent Campaigns
              </h2>
            </div>
            <Link
              to="/campaigns/new"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-200"
              style={{
                background: "rgba(99,102,241,0.12)",
                border: "1px solid rgba(99,102,241,0.25)",
                color: "#818cf8",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              <Plus className="w-3 h-3" /> New Campaign
            </Link>
          </div>

          {/* Column labels */}
          {campaigns.length > 0 && (
            <div
              className="flex items-center px-3 sm:px-6 py-2.5 gap-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
            >
              <p className="flex-1 text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: "#334155", fontFamily: "'Space Grotesk', sans-serif" }}>Business</p>
              <p className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: "#334155", fontFamily: "'Space Grotesk', sans-serif" }}>Status</p>
              <p className="hidden sm:block text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: "#334155", fontFamily: "'Space Grotesk', sans-serif" }}>Created</p>
            </div>
          )}

          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.03)" }}>
            {campaigns.slice(0, 8).map((c, i) => {
              const badge = STATUS_BADGE[c.status] ?? STATUS_BADGE.CREATED;
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.04 }}
                >
                  <Link
                    to={`/campaigns/${c.id}`}
                    className="flex items-center gap-3 sm:gap-4 px-3 sm:px-6 py-3.5 transition-all duration-150 group"
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.04)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Avatar */}
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-[11px] font-bold"
                        style={{
                          background: `${badge.dot}18`,
                          color: badge.dot,
                          fontFamily: "'Syne', sans-serif",
                          border: `1px solid ${badge.dot}25`,
                        }}
                      >
                        {c.business_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-slate-200 truncate group-hover:text-white transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          {c.business_name}
                        </p>
                        <p className="text-[11px] text-slate-600 truncate mt-0.5">{c.industry} · {c.location}</p>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold whitespace-nowrap flex-shrink-0"
                      style={{
                        background: badge.bg,
                        color: badge.text,
                        border: `1px solid ${badge.dot}30`,
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: badge.dot }} />
                      <span className="hidden xs:inline">{c.status.replace(/_/g, " ")}</span>
                    </div>

                    <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                      <span className="text-[11px] text-slate-600 whitespace-nowrap">
                        {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-700 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <ArrowRight className="sm:hidden w-3.5 h-3.5 text-slate-700 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
                  </Link>
                </motion.div>
              );
            })}

            {campaigns.length === 0 && (
              <div className="flex flex-col items-center py-20 gap-5">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}
                >
                  <Zap className="w-7 h-7" style={{ color: "#4338ca" }} />
                </div>
                <div className="text-center">
                  <p className="text-[14px] font-semibold text-slate-400 mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>No campaigns yet</p>
                  <p className="text-[12px] text-slate-600">Launch your first AI-powered marketing campaign</p>
                </div>
                <Link
                  to="/campaigns/new"
                  className="btn-primary flex items-center gap-2 px-5 py-2.5 text-[13px]"
                >
                  <Plus className="w-3.5 h-3.5" /> Launch Campaign
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
