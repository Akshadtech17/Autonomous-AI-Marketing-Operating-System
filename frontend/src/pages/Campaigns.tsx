import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Zap, Calendar, MapPin, Target } from "lucide-react";
import { api } from "@/services/api";
import { useCampaignStore } from "@/store/campaignStore";
import { Header } from "@/components/layout/Header";
import { formatDistanceToNow } from "date-fns";

const STATUS_COLOR: Record<string, string> = {
  COMPLETED:           "bg-green-500/20 text-green-400 border-green-500/30",
  FAILED:              "bg-red-500/20 text-red-400 border-red-500/30",
  CREATED:             "bg-slate-500/20 text-slate-400 border-slate-500/30",
  PLANNING:            "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  RUNNING_RESEARCH:    "bg-blue-500/20 text-blue-400 border-blue-500/30",
  RUNNING_SEO:         "bg-green-500/20 text-green-400 border-green-500/30",
  RUNNING_CONTENT:     "bg-purple-500/20 text-purple-400 border-purple-500/30",
  RUNNING_SOCIAL:      "bg-pink-500/20 text-pink-400 border-pink-500/30",
  RUNNING_ANALYTICS:   "bg-orange-500/20 text-orange-400 border-orange-500/30",
  REVIEW:              "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  REPORT_GENERATION:   "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
};

export function Campaigns() {
  const { setCampaigns, campaigns } = useCampaignStore();
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ["campaigns"],
    queryFn: api.campaigns.list,
    refetchInterval: 5000,
  });

  useEffect(() => { if (data) setCampaigns(data); }, [data]);

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="Campaigns" />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-slate-400 text-sm">{campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""}</p>
          <Link
            to="/campaigns/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold hover:from-indigo-400 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/25"
          >
            <Plus className="w-4 h-4" /> New Campaign
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {campaigns.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/campaigns/${c.id}`)}
              className="glass-hover p-5 rounded-xl cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/30 to-purple-600/30 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{c.business_name}</p>
                    <p className="text-xs text-slate-500">{c.industry}</p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_COLOR[c.status] ?? STATUS_COLOR.CREATED}`}>
                  {c.status.replace(/_/g, " ")}
                </span>
              </div>

              <p className="text-xs text-slate-400 mb-3 line-clamp-2">{c.goal}</p>

              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.location}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />
                  {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {campaigns.length === 0 && (
          <div className="flex flex-col items-center py-24 gap-4">
            <Target className="w-12 h-12 text-slate-700" />
            <p className="text-slate-500">No campaigns yet. Launch your first AI campaign.</p>
            <Link to="/campaigns/new" className="px-6 py-3 rounded-xl bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-400 transition-all">
              Get Started
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
