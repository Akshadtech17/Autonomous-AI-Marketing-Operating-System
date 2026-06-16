import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FileText, Download, Calendar, Building2, Star, ChevronRight } from "lucide-react";
import { api } from "@/services/api";
import { useCampaignStore } from "@/store/campaignStore";
import { Header } from "@/components/layout/Header";
import { formatDistanceToNow } from "date-fns";

const INDUSTRY_COLOR: Record<string, string> = {
  Technology: "#22d3ee", SaaS: "#22d3ee", "E-commerce": "#f59e0b",
  Healthcare: "#10b981", Finance: "#6366f1", Education: "#a78bfa",
  "Real Estate": "#fb923c", "Food & Beverage": "#f472b6", Fashion: "#f43f5e",
  Travel: "#22d3ee", Consulting: "#8b5cf6", DEFAULT: "#6366f1",
};

const AGENT_ICONS: Record<string, { icon: string; label: string; color: string }> = {
  ceo_agent:               { icon: "👑", label: "CEO",       color: "#a78bfa" },
  research_agent:          { icon: "🔬", label: "Research",  color: "#22d3ee" },
  seo_agent:               { icon: "🎯", label: "SEO",       color: "#10b981" },
  content_agent:           { icon: "✍️", label: "Content",   color: "#f59e0b" },
  social_agent:            { icon: "📱", label: "Social",    color: "#f472b6" },
  analytics_agent:         { icon: "📊", label: "Analytics", color: "#fb923c" },
  creative_director_agent: { icon: "🎨", label: "Creative",  color: "#f43f5e" },
  report_agent:            { icon: "📋", label: "Report",    color: "#6366f1" },
};

export function Reports() {
  const { setCampaigns, campaigns } = useCampaignStore();

  const { data } = useQuery({
    queryKey: ["campaigns"],
    queryFn: api.campaigns.list,
  });

  useEffect(() => { if (data) setCampaigns(data); }, [data]);

  const completed = campaigns.filter((c) => c.status === "COMPLETED");

  return (
    <div className="flex-1 overflow-y-auto relative z-10">
      <Header title="Reports" />

      <div className="p-6 space-y-5">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] text-slate-500">
              <span className="font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>{completed.length}</span>
              {" "}report{completed.length !== 1 ? "s" : ""} available
            </p>
          </div>
          {completed.length > 0 && (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold"
              style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#10b981", fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <Star className="w-3 h-3" />
              All Completed
            </div>
          )}
        </div>

        {completed.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center py-28 gap-6"
          >
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.08) 100%)",
                border: "1px solid rgba(99,102,241,0.12)",
              }}
            >
              <FileText className="w-9 h-9" style={{ color: "#4338ca" }} />
            </div>
            <div className="text-center">
              <p className="text-[18px] font-bold text-slate-400 mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                No reports yet
              </p>
              <p className="text-[13px] text-slate-600">
                Completed campaigns generate downloadable PDF reports
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {completed.map((c, i) => {
              const ic = INDUSTRY_COLOR[c.industry] ?? INDUSTRY_COLOR.DEFAULT;
              const agentEntries = Object.entries(c.agent_outputs || {});
              const avgConfidence = agentEntries.length
                ? agentEntries.reduce((sum, [, o]) => sum + ((o as any)?.confidence_score ?? 0), 0) / agentEntries.length
                : 0;

              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-2xl overflow-hidden relative group"
                  style={{
                    background: "linear-gradient(135deg, rgba(12,19,37,0.95) 0%, rgba(8,13,26,0.98) 100%)",
                    border: "1px solid rgba(16,185,129,0.12)",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(16,185,129,0.3)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 40px rgba(0,0,0,0.5), 0 0 20px rgba(16,185,129,0.1)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(16,185,129,0.12)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(0,0,0,0.4)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                >
                  {/* Top accent */}
                  <div className="h-[2px]" style={{ background: `linear-gradient(90deg, #10b981, ${ic}60, transparent)` }} />

                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold"
                          style={{ background: `${ic}15`, border: `1px solid ${ic}25`, color: ic, fontFamily: "'Syne', sans-serif" }}
                        >
                          {c.business_name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-[14px] font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>{c.business_name}</h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Building2 className="w-3 h-3 text-slate-600" />
                            <p className="text-[11px] text-slate-500">{c.industry}</p>
                          </div>
                        </div>
                      </div>
                      <div
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold"
                        style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)", fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Complete
                      </div>
                    </div>

                    {/* Confidence */}
                    {avgConfidence > 0 && (
                      <div className="mb-4 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: "#475569", fontFamily: "'Space Grotesk', sans-serif" }}>
                            Avg Confidence
                          </span>
                          <span className="text-[12px] font-bold" style={{ color: "#10b981", fontFamily: "'Space Grotesk', sans-serif" }}>
                            {(avgConfidence * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${avgConfidence * 100}%`,
                              background: "linear-gradient(90deg, #10b981, #22d3ee)",
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Agent pills */}
                    {agentEntries.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {agentEntries.slice(0, 6).map(([agentName]) => {
                          const meta = AGENT_ICONS[agentName];
                          if (!meta) return null;
                          return (
                            <div
                              key={agentName}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold"
                              style={{
                                background: `${meta.color}10`,
                                border: `1px solid ${meta.color}20`,
                                color: meta.color,
                                fontFamily: "'Space Grotesk', sans-serif",
                              }}
                            >
                              <span>{meta.icon}</span>
                              <span>{meta.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Completion time */}
                    {c.completed_at && (
                      <div className="flex items-center gap-1.5 mb-4 text-[11px] text-slate-600">
                        <Calendar className="w-3 h-3" />
                        Completed {formatDistanceToNow(new Date(c.completed_at), { addSuffix: true })}
                      </div>
                    )}

                    {/* Download button */}
                    <a
                      href={api.reports.download(c.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2.5 py-3 rounded-xl text-[13px] font-bold transition-all duration-200"
                      style={{
                        background: "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.15) 100%)",
                        border: "1px solid rgba(99,102,241,0.25)",
                        color: "#818cf8",
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)";
                        (e.currentTarget as HTMLElement).style.borderColor = "transparent";
                        (e.currentTarget as HTMLElement).style.color = "white";
                        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(99,102,241,0.4)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.15) 100%)";
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(99,102,241,0.25)";
                        (e.currentTarget as HTMLElement).style.color = "#818cf8";
                        (e.currentTarget as HTMLElement).style.boxShadow = "none";
                      }}
                    >
                      <Download className="w-4 h-4" />
                      Download PDF Report
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
