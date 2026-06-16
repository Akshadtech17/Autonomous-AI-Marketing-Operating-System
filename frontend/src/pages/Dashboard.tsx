import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, TrendingUp, Zap, CheckCircle, XCircle } from "lucide-react";
import { api } from "@/services/api";
import { useCampaignStore } from "@/store/campaignStore";
import { useGlobalWebSocket } from "@/hooks/useWebSocket";
import { Header } from "@/components/layout/Header";
import { SystemVisualization } from "@/three/SystemVisualization";
import { EventFeed } from "@/components/live/EventFeed";
import { formatDistanceToNow } from "date-fns";


const STATUS_BADGE: Record<string, string> = {
  COMPLETED:           "bg-green-500/20 text-green-400 border-green-500/30",
  FAILED:              "bg-red-500/20 text-red-400 border-red-500/30",
  PLANNING:            "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  RUNNING_RESEARCH:    "bg-blue-500/20 text-blue-400 border-blue-500/30",
  RUNNING_SEO:         "bg-green-500/20 text-green-400 border-green-500/30",
  RUNNING_CONTENT:     "bg-purple-500/20 text-purple-400 border-purple-500/30",
  RUNNING_SOCIAL:      "bg-pink-500/20 text-pink-400 border-pink-500/30",
  RUNNING_ANALYTICS:   "bg-orange-500/20 text-orange-400 border-orange-500/30",
  REVIEW:              "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  REPORT_GENERATION:   "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  CREATED:             "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

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
    <div className="flex-1 overflow-y-auto">
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Campaigns", value: stats.total,     icon: Zap,         color: "text-indigo-400" },
            { label: "Completed",        value: stats.completed, icon: CheckCircle, color: "text-green-400" },
            { label: "Running",          value: stats.running,   icon: TrendingUp,  color: "text-yellow-400" },
            { label: "Failed",           value: stats.failed,    icon: XCircle,     color: "text-red-400" },
          ].map(({ label, value, icon: Icon, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass p-5 rounded-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</span>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
            </motion.div>
          ))}
        </div>

        {/* 3D + Event Feed */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <SystemVisualization />
          </div>
          <EventFeed />
        </div>

        {/* Campaign List */}
        <div className="glass rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Recent Campaigns</h2>
            <Link
              to="/campaigns/new"
              className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> New Campaign
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {campaigns.slice(0, 8).map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  to={`/campaigns/${c.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-white/3 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{c.business_name}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{c.industry} · {c.location}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_BADGE[c.status] ?? STATUS_BADGE.CREATED}`}>
                    {c.status.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-slate-600 flex-shrink-0">
                    {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                  </span>
                </Link>
              </motion.div>
            ))}
            {campaigns.length === 0 && (
              <div className="flex flex-col items-center py-16 gap-4">
                <Zap className="w-8 h-8 text-slate-600" />
                <p className="text-slate-500 text-sm">No campaigns yet</p>
                <Link
                  to="/campaigns/new"
                  className="px-4 py-2 rounded-lg bg-indigo-500/20 text-indigo-400 text-sm border border-indigo-500/30 hover:bg-indigo-500/30 transition-all"
                >
                  Launch your first campaign
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
