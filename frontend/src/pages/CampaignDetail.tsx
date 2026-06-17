import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Download, RefreshCw } from "lucide-react";
import { api } from "@/services/api";
import { useCampaignStore } from "@/store/campaignStore";
import { useCampaignWebSocket } from "@/hooks/useWebSocket";
import { Header } from "@/components/layout/Header";
import { AgentStatusCard } from "@/components/campaign/AgentStatusCard";
import { EventFeed } from "@/components/live/EventFeed";

const AGENT_ORDER = [
  "ceo_agent", "research_agent", "seo_agent", "content_agent",
  "social_agent", "analytics_agent", "creative_director_agent", "report_agent",
];

const PROGRESS_STEPS: Record<string, number> = {
  CREATED: 0, PLANNING: 5,
  RUNNING_RESEARCH: 15, RUNNING_SEO: 30,
  RUNNING_CONTENT: 45, RUNNING_SOCIAL: 60,
  RUNNING_ANALYTICS: 75, REVIEW: 85,
  REPORT_GENERATION: 95, COMPLETED: 100, FAILED: 0,
};

export function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const { setActiveCampaign, activeCampaign, agentProgress } = useCampaignStore();

  useCampaignWebSocket(id ?? null);

  const { data, refetch } = useQuery({
    queryKey: ["campaign", id],
    queryFn: () => api.campaigns.get(id!),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && ["COMPLETED", "FAILED"].includes(status) ? false : 3000;
    },
  });

  useEffect(() => { if (data) setActiveCampaign(data); }, [data]);

  const campaign = activeCampaign;
  if (!campaign) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-slate-500">Loading campaign...</div>
    </div>
  );

  const overallProgress = PROGRESS_STEPS[campaign.status] ?? 0;

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title={campaign.business_name} />
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">

        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            {campaign.status === "COMPLETED" && (
              <a
                href={api.reports.download(campaign.id)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 text-sm hover:bg-green-500/30 transition-all"
              >
                <Download className="w-4 h-4" /> Download Report
              </a>
            )}
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-slate-400 border border-white/10 text-sm hover:bg-white/10 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Campaign header */}
        <div className="glass p-6 rounded-xl">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">{campaign.business_name}</h2>
              <p className="text-slate-400 text-sm">{campaign.industry} · {campaign.location}</p>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
              campaign.status === "COMPLETED" ? "bg-green-500/20 text-green-400 border-green-500/30"
              : campaign.status === "FAILED" ? "bg-red-500/20 text-red-400 border-red-500/30"
              : "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
            }`}>
              {campaign.status.replace(/_/g, " ")}
            </span>
          </div>

          <p className="text-sm text-slate-300 mb-4">{campaign.goal}</p>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Overall Progress</span>
              <span>{overallProgress}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <motion.div
                className="h-2 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Agent Grid */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-semibold text-white">Agent Execution</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AGENT_ORDER.map((agentName) => {
                const progress = agentProgress[agentName];
                const output = campaign.agent_outputs?.[agentName];
                const state = progress?.state
                  ?? (output ? "COMPLETED" : "PENDING");
                return (
                  <AgentStatusCard
                    key={agentName}
                    agentName={agentName}
                    state={state}
                    progress={progress?.progress ?? (output ? 100 : 0)}
                    message={progress?.message ?? (output ? "Completed" : "Waiting")}
                    confidenceScore={output?.confidence_score}
                  />
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <EventFeed />
            {campaign.agent_outputs && Object.keys(campaign.agent_outputs).length > 0 && (
              <div className="glass rounded-xl p-4">
                <h4 className="text-xs font-semibold text-white mb-3 uppercase tracking-wider">Agent Outputs</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {Object.entries(campaign.agent_outputs).map(([agent, output]) => (
                    <div key={agent} className="text-xs">
                      <p className="text-indigo-400 font-medium mb-1">{agent}</p>
                      <p className="text-slate-400 line-clamp-3">{output?.output}</p>
                      {output?.key_insights?.length > 0 && (
                        <ul className="mt-1 space-y-0.5">
                          {output.key_insights.slice(0, 2).map((insight, i) => (
                            <li key={i} className="text-slate-500">• {insight}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {campaign.error_message && (
          <div className="glass border border-red-500/30 rounded-xl p-4">
            <p className="text-xs font-semibold text-red-400 mb-1 uppercase">System Failure</p>
            <p className="text-sm text-red-300 font-mono">{campaign.error_message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
