import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Plus, TrendingUp, Zap, CheckCircle, XCircle, ArrowRight, Activity,
  BookOpen, Cpu, Clock, Rocket, GitBranch, ChevronRight,
} from "lucide-react";
import { api } from "@/services/api";
import { useCampaignStore } from "@/store/campaignStore";
import { useGlobalWebSocket } from "@/hooks/useWebSocket";
import { Header } from "@/components/layout/Header";
import { SystemVisualization } from "@/three/SystemVisualization";
import { EventFeed } from "@/components/live/EventFeed";
import { formatDistanceToNow } from "date-fns";

/* ─── Data ──────────────────────────────────────────────────────────────── */

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

const AGENTS = [
  {
    icon: "👑", label: "CEO Agent",       color: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.2)",
    role: "Orchestrator",
    desc: "Analyzes your campaign brief, builds the master strategy, and coordinates the entire agent pipeline.",
    output: "Strategic direction & task assignments",
  },
  {
    icon: "🔬", label: "Research Agent",  color: "#22d3ee", bg: "rgba(34,211,238,0.08)",  border: "rgba(34,211,238,0.2)",
    role: "Market Intel",
    desc: "Deep-dives into market trends, competitor landscape, and audience psychographics using live data.",
    output: "Market research report & competitor analysis",
  },
  {
    icon: "🎯", label: "SEO Agent",       color: "#10b981", bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.2)",
    role: "Search Strategy",
    desc: "Identifies high-value keywords, content gaps, technical SEO opportunities, and backlink strategies.",
    output: "Keyword clusters & SEO action plan",
  },
  {
    icon: "✍️", label: "Content Agent",  color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.2)",
    role: "Editorial",
    desc: "Produces blog posts, email sequences, landing page copy, and ad creatives tailored to your brand voice.",
    output: "Full content calendar & copy library",
  },
  {
    icon: "📱", label: "Social Agent",    color: "#f472b6", bg: "rgba(244,114,182,0.08)", border: "rgba(244,114,182,0.2)",
    role: "Platforms",
    desc: "Creates platform-native content for Instagram, LinkedIn, X, and TikTok — each with optimal posting schedules.",
    output: "30-day social media playbook",
  },
  {
    icon: "📊", label: "Analytics Agent", color: "#fb923c", bg: "rgba(251,146,60,0.08)",  border: "rgba(251,146,60,0.2)",
    role: "KPIs & Data",
    desc: "Defines success metrics, builds measurement frameworks, and projects ROI across all channels.",
    output: "KPI dashboard & ROI projections",
  },
  {
    icon: "🎨", label: "Creative Director",color: "#f43f5e", bg: "rgba(244,63,94,0.08)", border: "rgba(244,63,94,0.2)",
    role: "Brand Vision",
    desc: "Crafts visual identity guidelines, colour palettes, typography choices, and creative concepts.",
    output: "Brand style guide & creative brief",
  },
  {
    icon: "📋", label: "Report Agent",    color: "#6366f1", bg: "rgba(99,102,241,0.08)",  border: "rgba(99,102,241,0.2)",
    role: "Compiler",
    desc: "Synthesises every agent's output into a polished, downloadable PDF marketing strategy report.",
    output: "Comprehensive PDF strategy report",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Define Your Campaign",
    desc: "Fill in your business name, industry, location, goal, target audience, and budget. Takes under 2 minutes.",
    color: "#6366f1",
    icon: BookOpen,
  },
  {
    step: "02",
    title: "8 AI Agents Execute",
    desc: "The agent pipeline kicks off automatically. Each specialist agent builds on the previous one's output in real time.",
    color: "#22d3ee",
    icon: Cpu,
  },
  {
    step: "03",
    title: "Download Your Strategy",
    desc: "Once complete, download a comprehensive PDF containing every element of your marketing strategy.",
    color: "#10b981",
    icon: GitBranch,
  },
];

const ROADMAP = [
  {
    phase: "Phase 1",
    status: "live",
    label: "Current",
    color: "#10b981",
    items: [
      "8-agent autonomous pipeline (CEO → Report)",
      "Real-time WebSocket event monitoring",
      "3D interactive agent network view",
      "PDF strategy report generation",
      "Campaign history & analytics",
      "Multi-industry support (14 verticals)",
    ],
  },
  {
    phase: "Phase 2",
    status: "building",
    label: "Q3 2026",
    color: "#f59e0b",
    items: [
      "Campaign scheduling & automation",
      "A/B testing recommendation engine",
      "Multi-language report generation",
      "HubSpot & Mailchimp integrations",
      "Custom brand voice training",
      "Team collaboration & workspaces",
    ],
  },
  {
    phase: "Phase 3",
    status: "planned",
    label: "Q4 2026",
    color: "#a78bfa",
    items: [
      "Custom agent creation studio",
      "White-label client reports",
      "Public REST API access",
      "Campaign performance tracking",
      "AI-powered ad creative generation",
      "Enterprise SSO & audit logs",
    ],
  },
];

/* ─── Sub-components ─────────────────────────────────────────────────────── */

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
      <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full transition-all duration-300 group-hover:scale-125"
        style={{ background: `radial-gradient(circle, ${color}18 0%, transparent 70%)` }} />
      <div className="absolute bottom-0 left-0 right-0 h-[1px]"
        style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase"
            style={{ color: "#475569", fontFamily: "'Space Grotesk', sans-serif" }}>{label}</p>
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

/* ─── Main page ──────────────────────────────────────────────────────────── */

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

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STATS_CONFIG.map(({ key, label, icon, color, glow }, i) => (
            <StatCard key={key} label={label} value={stats[key as keyof typeof stats]}
              icon={icon} color={color} glow={glow} delay={i * 0.06} />
          ))}
        </div>

        {/* ── 3D vis + event feed ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="lg:col-span-2 rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(12,19,37,0.9) 0%, rgba(8,13,26,0.95) 100%)",
              border: "1px solid rgba(99,102,241,0.1)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
            }}
          >
            <div className="flex items-center justify-between px-5 py-3.5"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: "#6366f1", boxShadow: "0 0 6px #6366f1" }} />
                <span className="text-[11px] font-bold tracking-[0.12em] uppercase"
                  style={{ color: "#6366f1", fontFamily: "'Space Grotesk', sans-serif" }}>Agent Network</span>
              </div>
              <span className="text-[10px] text-slate-600">Live</span>
            </div>
            <SystemVisualization />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
            <EventFeed />
          </motion.div>
        </div>

        {/* ── Recent campaigns ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(12,19,37,0.9) 0%, rgba(8,13,26,0.95) 100%)",
            border: "1px solid rgba(255,255,255,0.05)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
          }}
        >
          <div className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
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

          {campaigns.length > 0 && (
            <div className="flex items-center px-3 sm:px-6 py-2.5 gap-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
              <p className="flex-1 text-[10px] font-bold tracking-[0.12em] uppercase"
                style={{ color: "#334155", fontFamily: "'Space Grotesk', sans-serif" }}>Business</p>
              <p className="text-[10px] font-bold tracking-[0.12em] uppercase"
                style={{ color: "#334155", fontFamily: "'Space Grotesk', sans-serif" }}>Status</p>
              <p className="hidden sm:block text-[10px] font-bold tracking-[0.12em] uppercase"
                style={{ color: "#334155", fontFamily: "'Space Grotesk', sans-serif" }}>Created</p>
            </div>
          )}

          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.03)" }}>
            {campaigns.slice(0, 8).map((c, i) => {
              const badge = STATUS_BADGE[c.status] ?? STATUS_BADGE.CREATED;
              return (
                <motion.div key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.04 }}>
                  <Link
                    to={`/campaigns/${c.id}`}
                    className="flex items-center gap-3 sm:gap-4 px-3 sm:px-6 py-3.5 transition-all duration-150 group"
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.04)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-[11px] font-bold"
                        style={{ background: `${badge.dot}18`, color: badge.dot, fontFamily: "'Syne', sans-serif", border: `1px solid ${badge.dot}25` }}>
                        {c.business_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-slate-200 truncate group-hover:text-white transition-colors"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{c.business_name}</p>
                        <p className="text-[11px] text-slate-600 truncate mt-0.5">{c.industry} · {c.location}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold whitespace-nowrap flex-shrink-0"
                      style={{ background: badge.bg, color: badge.text, border: `1px solid ${badge.dot}30`, fontFamily: "'Space Grotesk', sans-serif" }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: badge.dot }} />
                      {c.status.replace(/_/g, " ")}
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
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}>
                  <Zap className="w-7 h-7" style={{ color: "#4338ca" }} />
                </div>
                <div className="text-center">
                  <p className="text-[14px] font-semibold text-slate-400 mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>No campaigns yet</p>
                  <p className="text-[12px] text-slate-600">Launch your first AI-powered marketing campaign</p>
                </div>
                <Link to="/campaigns/new" className="btn-primary flex items-center gap-2 px-5 py-2.5 text-[13px]">
                  <Plus className="w-3.5 h-3.5" /> Launch Campaign
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* ════════════════════════════════════════════════════════
            PRODUCT INFO SECTION
        ════════════════════════════════════════════════════════ */}

        {/* ── Divider ── */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="flex items-center gap-4 py-2"
        >
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.2))" }} />
          <div className="flex items-center gap-2 px-3 py-1 rounded-full"
            style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)" }}>
            <BookOpen className="w-3 h-3" style={{ color: "#6366f1" }} />
            <span className="text-[10px] font-bold tracking-[0.14em] uppercase"
              style={{ color: "#6366f1", fontFamily: "'Space Grotesk', sans-serif" }}>Product Guide</span>
          </div>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(99,102,241,0.2), transparent)" }} />
        </motion.div>

        {/* ── Hero overview + How it works ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(10,16,32,0.95) 0%, rgba(6,10,20,0.98) 100%)",
            border: "1px solid rgba(99,102,241,0.12)",
            boxShadow: "0 4px 32px rgba(0,0,0,0.5)",
          }}
        >
          {/* Top accent */}
          <div className="h-[2px]"
            style={{ background: "linear-gradient(90deg, #6366f1, #a78bfa, #22d3ee, transparent)" }} />

          <div className="p-6 md:p-8">
            {/* Badge */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase"
                style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.25)", fontFamily: "'Space Grotesk', sans-serif" }}>
                AI Marketing OS
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase"
                style={{ background: "rgba(16,185,129,0.08)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)", fontFamily: "'Space Grotesk', sans-serif" }}>
                ● Live
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase"
                style={{ background: "rgba(34,211,238,0.08)", color: "#22d3ee", border: "1px solid rgba(34,211,238,0.2)", fontFamily: "'Space Grotesk', sans-serif" }}>
                Powered by Groq
              </span>
            </div>

            {/* Headline */}
            <h2
              className="text-[22px] sm:text-[28px] font-bold leading-tight mb-3"
              style={{ fontFamily: "'Syne', sans-serif", color: "#f1f5f9" }}
            >
              Your Autonomous{" "}
              <span style={{
                background: "linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #f472b6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                AI Marketing Team
              </span>
            </h2>
            <p className="text-[13px] text-slate-400 leading-relaxed max-w-2xl mb-8"
              style={{ fontFamily: "'Inter', sans-serif" }}>
              Lost In Frame Production is a fully autonomous marketing operating system. You provide a campaign brief — business
              name, industry, goal, and budget — and 8 specialised AI agents immediately go to work in a coordinated pipeline,
              each handing off their output to the next until a complete, professional marketing strategy is compiled into a
              downloadable PDF. No prompting required. No back-and-forth. Just results.
            </p>

            {/* How it works steps */}
            <p className="text-[10px] font-bold tracking-[0.16em] uppercase mb-4"
              style={{ color: "#334155", fontFamily: "'Space Grotesk', sans-serif" }}>How It Works</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {HOW_IT_WORKS.map(({ step, title, desc, color, icon: Icon }, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                  className="relative p-4 rounded-xl"
                  style={{
                    background: `${color}06`,
                    border: `1px solid ${color}20`,
                  }}
                >
                  {/* Step number */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <span className="text-[11px] font-black tracking-[0.1em]"
                      style={{ color, fontFamily: "'Space Grotesk', sans-serif" }}>STEP {step}</span>
                  </div>
                  <h3 className="text-[13px] font-bold text-white mb-1.5"
                    style={{ fontFamily: "'Syne', sans-serif" }}>{title}</h3>
                  <p className="text-[12px] text-slate-500 leading-relaxed">{desc}</p>

                  {/* Connector arrow (not last) */}
                  {i < 2 && (
                    <ChevronRight
                      className="absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 hidden sm:block z-10"
                      style={{ color: "#334155" }}
                    />
                  )}
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/campaigns/new"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-200"
                style={{
                  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  color: "white",
                  fontFamily: "'Space Grotesk', sans-serif",
                  boxShadow: "0 4px 16px rgba(99,102,241,0.4)",
                }}
              >
                <Zap className="w-4 h-4" /> Launch Your First Campaign
              </Link>
              <Link
                to="/monitor"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200"
                style={{
                  background: "rgba(34,211,238,0.08)",
                  border: "1px solid rgba(34,211,238,0.2)",
                  color: "#22d3ee",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                <Activity className="w-4 h-4" /> Watch Live Monitor
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ── Agent pipeline ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(10,16,32,0.95) 0%, rgba(6,10,20,0.98) 100%)",
            border: "1px solid rgba(255,255,255,0.05)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
          }}
        >
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(99,102,241,0.15)" }}>
                <Cpu className="w-3.5 h-3.5" style={{ color: "#6366f1" }} />
              </div>
              <div>
                <h2 className="text-[13px] font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                  Meet Your 8 AI Agents
                </h2>
                <p className="text-[10px] text-slate-600" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Sequential DAG pipeline — each agent passes context to the next
                </p>
              </div>
            </div>
            {/* Pipeline flow badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
              style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.12)" }}>
              <GitBranch className="w-3 h-3" style={{ color: "#6366f1" }} />
              <span className="text-[10px] font-bold tracking-wider uppercase"
                style={{ color: "#4338ca", fontFamily: "'Space Grotesk', sans-serif" }}>Auto-Sequential</span>
            </div>
          </div>

          <div className="p-4 md:p-6">
            {/* Pipeline connector row */}
            <div className="hidden md:flex items-center justify-between mb-4 px-2">
              {AGENTS.map((a, i) => (
                <div key={a.label} className="flex items-center">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] flex-shrink-0"
                    style={{ background: `${a.color}18`, border: `1px solid ${a.color}30` }}>
                    {a.icon}
                  </div>
                  {i < AGENTS.length - 1 && (
                    <div className="w-8 h-[1px] mx-0.5"
                      style={{ background: `linear-gradient(90deg, ${a.color}50, ${AGENTS[i+1].color}50)` }} />
                  )}
                </div>
              ))}
            </div>

            {/* Agent cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {AGENTS.map((agent, i) => (
                <motion.div
                  key={agent.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.05 }}
                  className="relative rounded-xl p-4 group overflow-hidden"
                  style={{
                    background: agent.bg,
                    border: `1px solid ${agent.border}`,
                    transition: "all 0.25s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = agent.color + "50";
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px rgba(0,0,0,0.4), 0 0 16px ${agent.color}15`;
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = agent.border;
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                >
                  {/* Top accent */}
                  <div className="absolute top-0 left-0 right-0 h-[1.5px]"
                    style={{ background: `linear-gradient(90deg, ${agent.color}70, ${agent.color}20, transparent)` }} />

                  {/* Step number */}
                  <div className="absolute top-3 right-3 text-[10px] font-black"
                    style={{ color: agent.color + "40", fontFamily: "'Space Grotesk', sans-serif" }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>

                  {/* Icon + name */}
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[18px] flex-shrink-0"
                      style={{ background: `${agent.color}15`, border: `1px solid ${agent.color}25` }}>
                      {agent.icon}
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-white leading-tight"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{agent.label}</p>
                      <p className="text-[10px] font-semibold" style={{ color: agent.color }}>
                        {agent.role}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-3">{agent.desc}</p>

                  {/* Output */}
                  <div className="flex items-start gap-1.5 p-2 rounded-lg"
                    style={{ background: `${agent.color}08`, border: `1px solid ${agent.color}15` }}>
                    <ArrowRight className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: agent.color }} />
                    <p className="text-[10px] font-semibold leading-tight" style={{ color: agent.color + "cc" }}>
                      {agent.output}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Roadmap ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(10,16,32,0.95) 0%, rgba(6,10,20,0.98) 100%)",
            border: "1px solid rgba(255,255,255,0.05)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-2.5 px-6 py-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(167,139,250,0.12)" }}>
              <Rocket className="w-3.5 h-3.5" style={{ color: "#a78bfa" }} />
            </div>
            <div>
              <h2 className="text-[13px] font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                Product Roadmap
              </h2>
              <p className="text-[10px] text-slate-600" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                What's live, what's building, what's next
              </p>
            </div>
          </div>

          <div className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ROADMAP.map((phase, i) => (
                <motion.div
                  key={phase.phase}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.08 }}
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: `${phase.color}06`,
                    border: `1px solid ${phase.color}20`,
                  }}
                >
                  {/* Phase header */}
                  <div className="px-4 py-3 flex items-center justify-between"
                    style={{ borderBottom: `1px solid ${phase.color}15` }}>
                    <div>
                      <p className="text-[10px] font-black tracking-[0.12em] uppercase"
                        style={{ color: phase.color, fontFamily: "'Space Grotesk', sans-serif" }}>
                        {phase.phase}
                      </p>
                      <p className="text-[12px] font-bold text-white mt-0.5"
                        style={{ fontFamily: "'Syne', sans-serif" }}>
                        {phase.status === "live" ? "Live Now" : phase.status === "building" ? "In Progress" : "Planned"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                      style={{ background: `${phase.color}12`, border: `1px solid ${phase.color}25` }}>
                      {phase.status === "live"     && <CheckCircle className="w-3 h-3" style={{ color: phase.color }} />}
                      {phase.status === "building" && <Clock className="w-3 h-3" style={{ color: phase.color }} />}
                      {phase.status === "planned"  && <Rocket className="w-3 h-3" style={{ color: phase.color }} />}
                      <span className="text-[10px] font-bold" style={{ color: phase.color, fontFamily: "'Space Grotesk', sans-serif" }}>
                        {phase.label}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <ul className="p-4 space-y-2">
                    {phase.items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                          style={{ background: phase.color }} />
                        <span className="text-[12px] text-slate-400 leading-relaxed"
                          style={{ fontFamily: "'Inter', sans-serif" }}>
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>

            {/* Footer note */}
            <p className="text-center text-[11px] text-slate-700 mt-5"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Roadmap subject to change · Built with FastAPI + React + Groq API (Qwen3 8B / LLaMA 3.2) · Deployed on Render + Netlify
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
