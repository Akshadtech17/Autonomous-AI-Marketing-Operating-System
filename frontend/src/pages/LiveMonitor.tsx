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

const AGENT_NAMES = [
  "ceo_agent", "research_agent", "seo_agent", "content_agent",
  "social_agent", "analytics_agent", "creative_director_agent", "report_agent",
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

  const activeCampaigns = campaigns.filter(
    (c) => !["COMPLETED","FAILED","CREATED"].includes(c.status)
  );

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="Live Monitor" />
      <div className="p-6 space-y-6">

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <SystemVisualization />
          </div>
          <div className="space-y-4">
            <div className="glass p-4 rounded-xl">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Active Campaigns</p>
              <p className="text-3xl font-bold text-indigo-400">{activeCampaigns.length}</p>
              <p className="text-xs text-slate-500 mt-1">
                {campaigns.filter((c) => c.status === "COMPLETED").length} completed
              </p>
            </div>
            <EventFeed />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white mb-4">Agent Status Grid</h3>
          <div className="grid grid-cols-4 gap-3">
            {AGENT_NAMES.map((agentName) => {
              const progress = agentProgress[agentName];
              return (
                <AgentStatusCard
                  key={agentName}
                  agentName={agentName}
                  state={progress?.state ?? "PENDING"}
                  progress={progress?.progress ?? 0}
                  message={progress?.message ?? "Idle"}
                />
              );
            })}
          </div>
        </div>

        {activeCampaigns.length > 0 && (
          <div className="glass rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10">
              <h3 className="text-sm font-semibold text-white">Running Campaigns</h3>
            </div>
            <div className="divide-y divide-white/5">
              {activeCampaigns.map((c) => (
                <motion.div
                  key={c.id}
                  className="flex items-center gap-4 px-6 py-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="status-dot bg-indigo-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{c.business_name}</p>
                    <p className="text-xs text-slate-500">{c.status.replace(/_/g, " ")}</p>
                  </div>
                  <span className="text-xs text-indigo-400 bg-indigo-500/20 px-2.5 py-1 rounded-full border border-indigo-500/30">
                    {c.status.replace(/_/g, " ")}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
