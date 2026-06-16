import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2, Clock, Zap } from "lucide-react";

const AGENT_META: Record<string, { label: string; color: string; bg: string; glow: string; icon: string; desc: string }> = {
  ceo_agent:               { label: "CEO",             color: "#a78bfa", bg: "rgba(167,139,250,0.1)",  glow: "rgba(167,139,250,0.3)",  icon: "👑", desc: "Orchestrator"    },
  research_agent:          { label: "Research",        color: "#22d3ee", bg: "rgba(34,211,238,0.1)",   glow: "rgba(34,211,238,0.3)",   icon: "🔬", desc: "Market Intel"   },
  seo_agent:               { label: "SEO",             color: "#10b981", bg: "rgba(16,185,129,0.1)",   glow: "rgba(16,185,129,0.3)",   icon: "🎯", desc: "Search Strategy" },
  content_agent:           { label: "Content",         color: "#f59e0b", bg: "rgba(245,158,11,0.1)",   glow: "rgba(245,158,11,0.3)",   icon: "✍️", desc: "Editorial"      },
  social_agent:            { label: "Social",          color: "#f472b6", bg: "rgba(244,114,182,0.1)",  glow: "rgba(244,114,182,0.3)",  icon: "📱", desc: "Platforms"      },
  analytics_agent:         { label: "Analytics",       color: "#fb923c", bg: "rgba(251,146,60,0.1)",   glow: "rgba(251,146,60,0.3)",   icon: "📊", desc: "KPIs & Data"    },
  creative_director_agent: { label: "Creative",        color: "#f43f5e", bg: "rgba(244,63,94,0.1)",    glow: "rgba(244,63,94,0.3)",    icon: "🎨", desc: "Brand Vision"   },
  report_agent:            { label: "Report",          color: "#6366f1", bg: "rgba(99,102,241,0.1)",   glow: "rgba(99,102,241,0.3)",   icon: "📋", desc: "Compiler"       },
};

interface Props {
  agentName: string;
  state: string;
  progress: number;
  message: string;
  confidenceScore?: number;
}

export function AgentStatusCard({ agentName, state, progress, message, confidenceScore }: Props) {
  const meta = AGENT_META[agentName] ?? { label: agentName, color: "#6366f1", bg: "rgba(99,102,241,0.1)", glow: "rgba(99,102,241,0.3)", icon: "🤖", desc: "Agent" };

  const isRunning   = state === "RUNNING";
  const isCompleted = state === "COMPLETED";
  const isFailed    = state === "FAILED";
  const isPending   = !isRunning && !isCompleted && !isFailed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl p-3.5 group"
      style={{
        background: isRunning
          ? `linear-gradient(135deg, rgba(12,19,37,0.95) 0%, rgba(8,13,26,0.98) 100%)`
          : "linear-gradient(135deg, rgba(10,16,32,0.9) 0%, rgba(6,10,20,0.95) 100%)",
        border: isRunning
          ? `1px solid ${meta.color}40`
          : isCompleted
          ? `1px solid ${meta.color}25`
          : isFailed
          ? "1px solid rgba(244,63,94,0.25)"
          : "1px solid rgba(255,255,255,0.05)",
        boxShadow: isRunning ? `0 0 20px ${meta.glow}, inset 0 0 20px ${meta.bg}` : "0 2px 12px rgba(0,0,0,0.3)",
        animation: isRunning ? "card-pulse 2s ease-in-out infinite" : "none",
        transition: "all 0.3s ease",
      }}
    >
      {/* Top glow bar when running */}
      {isRunning && (
        <div
          className="absolute top-0 left-0 right-0 h-[1.5px]"
          style={{ background: `linear-gradient(90deg, transparent, ${meta.color}, transparent)`, animation: "shimmer 2s linear infinite", backgroundSize: "200% 100%" }}
        />
      )}

      {/* Completed shimmer overlay */}
      {isCompleted && (
        <div className="absolute inset-0 rounded-xl pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${meta.color}08 0%, transparent 70%)` }} />
      )}

      {/* Header row */}
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex items-center gap-2">
          {/* Icon orb */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0 relative"
            style={{
              background: meta.bg,
              border: `1px solid ${meta.color}30`,
              boxShadow: isRunning || isCompleted ? `0 0 10px ${meta.glow}` : "none",
            }}
          >
            {meta.icon}
            {isRunning && (
              <div
                className="absolute -inset-0.5 rounded-lg animate-pulse"
                style={{ background: `${meta.color}15`, zIndex: -1 }}
              />
            )}
          </div>

          <div>
            <p className="text-[12px] font-bold text-white leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {meta.label}
            </p>
            <p className="text-[10px]" style={{ color: meta.color, fontFamily: "'Space Grotesk', sans-serif", opacity: 0.7 }}>
              {meta.desc}
            </p>
          </div>
        </div>

        {/* State icon */}
        <div className={`flex items-center gap-1 ${isFailed ? "text-rose-400" : isCompleted ? "text-emerald-400" : isRunning ? "" : "text-slate-600"}`}>
          {isRunning && (
            <div className="flex items-center gap-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: meta.color }} />
            </div>
          )}
          {isCompleted && <CheckCircle className="w-3.5 h-3.5" />}
          {isFailed    && <XCircle    className="w-3.5 h-3.5" />}
          {isPending   && <Clock      className="w-3.5 h-3.5" />}
        </div>
      </div>

      {/* Progress bar (running) */}
      {isRunning && (
        <div className="mb-2">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] text-slate-500 truncate max-w-[80%]">{message}</span>
            <span className="text-[10px] font-bold" style={{ color: meta.color, fontFamily: "'JetBrains Mono', monospace" }}>{progress}%</span>
          </div>
          <div className="h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${meta.color}, ${meta.color}aa)`,
                boxShadow: `0 0 8px ${meta.glow}`,
                backgroundSize: "200% 100%",
                animation: "shimmer-bar 1.5s linear infinite",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {/* Confidence badge (completed) */}
      {isCompleted && confidenceScore !== undefined && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-1.5 mt-1"
        >
          <Zap className="w-2.5 h-2.5" style={{ color: meta.color }} />
          <span className="text-[10px] font-bold" style={{ color: meta.color, fontFamily: "'Space Grotesk', sans-serif" }}>
            {(confidenceScore * 100).toFixed(0)}% confidence
          </span>
        </motion.div>
      )}

      {/* Failed message */}
      {isFailed && (
        <p className="text-[10px] text-rose-400 mt-1 truncate">{message || "Task failed"}</p>
      )}

      {/* Idle state */}
      {isPending && (
        <div className="flex items-center gap-1.5 mt-1">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
          <span className="text-[10px] text-slate-600">Waiting</span>
        </div>
      )}
    </motion.div>
  );
}
