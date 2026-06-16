import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FileText, Download, Calendar, Building2 } from "lucide-react";
import { api } from "@/services/api";
import { useCampaignStore } from "@/store/campaignStore";
import { Header } from "@/components/layout/Header";
import { formatDistanceToNow } from "date-fns";

export function Reports() {
  const { setCampaigns, campaigns } = useCampaignStore();

  const { data } = useQuery({
    queryKey: ["campaigns"],
    queryFn: api.campaigns.list,
  });

  useEffect(() => { if (data) setCampaigns(data); }, [data]);

  const completed = campaigns.filter((c) => c.status === "COMPLETED");

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="Reports" />
      <div className="p-6 space-y-4">
        <p className="text-slate-400 text-sm">{completed.length} report{completed.length !== 1 ? "s" : ""} available</p>

        {completed.length === 0 ? (
          <div className="flex flex-col items-center py-24 gap-4">
            <FileText className="w-12 h-12 text-slate-700" />
            <p className="text-slate-500">No completed campaigns yet. Reports will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {completed.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass p-6 rounded-xl"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-indigo-400" />
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 font-medium">
                    Complete
                  </span>
                </div>

                <h3 className="text-base font-semibold text-white mb-1">{c.business_name}</h3>
                <p className="text-xs text-slate-400 mb-4 flex items-center gap-1.5">
                  <Building2 className="w-3 h-3" /> {c.industry}
                </p>

                {c.completed_at && (
                  <p className="text-xs text-slate-500 mb-4 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    Completed {formatDistanceToNow(new Date(c.completed_at), { addSuffix: true })}
                  </p>
                )}

                <div className="space-y-2">
                  <a
                    href={api.reports.download(c.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-sm font-medium hover:bg-indigo-500/30 transition-all"
                  >
                    <Download className="w-4 h-4" /> Download PDF Report
                  </a>
                </div>

                {c.agent_outputs && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Key Insights</p>
                    {Object.entries(c.agent_outputs).slice(0, 2).map(([agent, output]) => (
                      <div key={agent} className="mb-2">
                        <p className="text-xs text-indigo-400 mb-1">{agent.replace(/_/g, " ")}</p>
                        {output?.key_insights?.slice(0, 1).map((insight, i) => (
                          <p key={i} className="text-xs text-slate-400 line-clamp-2">• {insight}</p>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
