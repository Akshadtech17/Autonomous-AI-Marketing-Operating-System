import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2, Clock, Zap } from "lucide-react";

const AGENT_META: Record<string, { label: string; color: string; icon: string }> = {
  ceo_agent:              { label: "CEO Orchestrator",      color: "purple",  icon: "👑" },
  research_agent:         { label: "Market Research",       color: "blue",    icon: "🔬" },
  seo_agent:              { label: "SEO Strategy",          color: "green",   icon: "🎯" },
  content_agent:          { label: "Content Strategy",      color: "yellow",  icon: "✍️" },
  social_agent:           { label: "Social Media",          color: "pink",    icon: "📱" },
  analytics_agent:        { label: "Analytics",             color: "orange",  icon: "📊" },
  creative_director_agent:{ label: "Creative Director",     color: "red",     icon: "🎨" },
  report_agent:           { label: "Report Compiler",       color: "indigo",  icon: "📋" },
};

const COLOR_CLASSES: Record<string, string> = {
  purple: "border-purple-500/30 bg-purple-500/10",
  blue:   "border-blue-500/30 bg-blue-500/10",
  green:  "border-green-500/30 bg-green-500/10",
  yellow: "border-yellow-500/30 bg-yellow-500/10",
  pink:   "border-pink-500/30 bg-pink-500/10",
  orange: "border-orange-500/30 bg-orange-500/10",
  red:    "border-red-500/30 bg-red-500/10",
  indigo: "border-indigo-500/30 bg-indigo-500/10",
};

interface Props {
  agentName: string;
  state: string;
  progress: number;
  message: string;
  confidenceScore?: number;
}

export function AgentStatusCard({ agentName, state, progress, message, confidenceScore }: Props) {
  const meta = AGENT_META[agentName] ?? { label: agentName, color: "indigo", icon: "🤖" };
  const colorClass = COLOR_CLASSES[meta.color] ?? COLOR_CLASSES.indigo;

  const StateIcon = state === "COMPLETED" ? CheckCircle
    : state === "FAILED" ? XCircle
    : state === "RUNNING" ? Loader2
    : Clock;

  const stateColor = state === "COMPLETED" ? "text-green-400"
    : state === "FAILED" ? "text-red-400"
    : state === "RUNNING" ? "text-indigo-400"
    : "text-slate-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`agent-card border ${colorClass} p-4`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{meta.icon}</span>
          <div>
            <p className="text-sm font-semibold text-white">{meta.label}</p>
            <p className="text-xs text-slate-500 font-mono">{agentName}</p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 ${stateColor}`}>
          <StateIcon className={`w-4 h-4 ${state === "RUNNING" ? "animate-spin" : ""}`} />
          <span className="text-xs font-medium">{state}</span>
        </div>
      </div>

      {state === "RUNNING" && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>{message}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5">
            <motion.div
              className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {state === "COMPLETED" && confidenceScore !== undefined && (
        <div className="flex items-center gap-2 mt-2">
          <Zap className="w-3 h-3 text-green-400" />
          <span className="text-xs text-slate-400">
            Confidence: <span className="text-green-400 font-medium">{(confidenceScore * 100).toFixed(0)}%</span>
          </span>
        </div>
      )}

      {state === "FAILED" && (
        <p className="text-xs text-red-400 mt-2 truncate">{message}</p>
      )}
    </motion.div>
  );
}
