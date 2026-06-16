import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Zap, MapPin, Calendar, ArrowRight } from "lucide-react";
import { api } from "@/services/api";
import { useCampaignStore } from "@/store/campaignStore";
import { Header } from "@/components/layout/Header";
import { formatDistanceToNow } from "date-fns";

const STATUS: Record<string, { color: string; bg: string; border: string; label: string }> = {
  COMPLETED:         { color: "#10b981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.2)",  label: "Completed"       },
  FAILED:            { color: "#f43f5e", bg: "rgba(244,63,94,0.1)",   border: "rgba(244,63,94,0.2)",   label: "Failed"          },
  CREATED:           { color: "#475569", bg: "rgba(71,85,105,0.1)",   border: "rgba(71,85,105,0.2)",   label: "Created"         },
  PLANNING:          { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.2)",  label: "Planning"        },
  RUNNING_RESEARCH:  { color: "#22d3ee", bg: "rgba(34,211,238,0.1)",  border: "rgba(34,211,238,0.2)",  label: "Researching"     },
  RUNNING_SEO:       { color: "#10b981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.2)",  label: "SEO Strategy"    },
  RUNNING_CONTENT:   { color: "#a78bfa", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.2)", label: "Content Plan"    },
  RUNNING_SOCIAL:    { color: "#f472b6", bg: "rgba(244,114,182,0.1)", border: "rgba(244,114,182,0.2)", label: "Social Media"    },
  RUNNING_ANALYTICS: { color: "#fb923c", bg: "rgba(251,146,60,0.1)",  border: "rgba(251,146,60,0.2)",  label: "Analytics"       },
  REVIEW:            { color: "#22d3ee", bg: "rgba(34,211,238,0.1)",  border: "rgba(34,211,238,0.2)",  label: "Under Review"    },
  REPORT_GENERATION: { color: "#6366f1", bg: "rgba(99,102,241,0.1)",  border: "rgba(99,102,241,0.2)",  label: "Generating PDF"  },
};

const INDUSTRY_COLOR: Record<string, string> = {
  Technology: "#22d3ee", SaaS: "#22d3ee", "E-commerce": "#f59e0b",
  Healthcare: "#10b981", Finance: "#6366f1", Education: "#a78bfa",
  "Real Estate": "#fb923c", "Food & Beverage": "#f472b6", Fashion: "#f43f5e",
  Travel: "#22d3ee", Consulting: "#8b5cf6",
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

  const running = campaigns.filter((c) => !["COMPLETED","FAILED","CREATED"].includes(c.status));

  return (
    <div className="flex-1 overflow-y-auto relative z-10">
      <Header title="Campaigns" />

      <div className="p-6 space-y-5">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="text-[13px] text-slate-500">
              <span className="font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>{campaigns.length}</span>
              {" "}campaign{campaigns.length !== 1 ? "s" : ""}
            </p>
            {running.length > 0 && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#818cf8", fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                {running.length} active
              </div>
            )}
          </div>
          <Link
            to="/campaigns/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              color: "white",
              fontFamily: "'Space Grotesk', sans-serif",
              boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            New Campaign
          </Link>
        </div>

        {/* Grid */}
        {campaigns.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {campaigns.map((c, i) => {
              const st = STATUS[c.status] ?? STATUS.CREATED;
              const industryColor = INDUSTRY_COLOR[c.industry] ?? "#6366f1";
              const isActive = !["COMPLETED","FAILED","CREATED"].includes(c.status);

              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  onClick={() => navigate(`/campaigns/${c.id}`)}
                  className="rounded-2xl overflow-hidden relative cursor-pointer group"
                  style={{
                    background: "linear-gradient(135deg, rgba(12,19,37,0.95) 0%, rgba(8,13,26,0.98) 100%)",
                    border: isActive ? `1px solid ${st.color}30` : "1px solid rgba(255,255,255,0.06)",
                    boxShadow: isActive ? `0 0 20px ${st.color}15` : "0 4px 16px rgba(0,0,0,0.3)",
                    transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = `${industryColor}35`;
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 40px rgba(0,0,0,0.5), 0 0 20px ${industryColor}15`;
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = isActive ? `${st.color}30` : "rgba(255,255,255,0.06)";
                    (e.currentTarget as HTMLElement).style.boxShadow = isActive ? `0 0 20px ${st.color}15` : "0 4px 16px rgba(0,0,0,0.3)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                >
                  {/* Top accent */}
                  <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${industryColor}60, ${industryColor}20, transparent)` }} />

                  {/* Active glow overlay */}
                  {isActive && (
                    <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${st.color}06 0%, transparent 60%)` }} />
                  )}

                  <div className="p-5 relative z-10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-[16px] font-bold flex-shrink-0"
                          style={{
                            background: `${industryColor}15`,
                            border: `1px solid ${industryColor}25`,
                            color: industryColor,
                            fontFamily: "'Syne', sans-serif",
                          }}
                        >
                          {c.business_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-white leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                            {c.business_name}
                          </p>
                          <p className="text-[11px] mt-0.5" style={{ color: industryColor, fontFamily: "'Space Grotesk', sans-serif" }}>
                            {c.industry}
                          </p>
                        </div>
                      </div>

                      <div
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
                        style={{
                          background: st.bg,
                          color: st.color,
                          border: `1px solid ${st.border}`,
                          fontFamily: "'Space Grotesk', sans-serif",
                        }}
                      >
                        {isActive && <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: st.color }} />}
                        {st.label}
                      </div>
                    </div>

                    {/* Goal */}
                    <p className="text-[12px] text-slate-500 line-clamp-2 mb-4 leading-relaxed">{c.goal}</p>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[11px] text-slate-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{c.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-700 group-hover:text-indigo-400 transition-colors">
                        <span className="text-[11px]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>View</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center py-28 gap-6"
          >
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.1) 100%)",
                border: "1px solid rgba(99,102,241,0.15)",
              }}
            >
              <Zap className="w-9 h-9" style={{ color: "#4338ca" }} />
            </div>
            <div className="text-center">
              <p className="text-[18px] font-bold text-slate-300 mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                No campaigns yet
              </p>
              <p className="text-[13px] text-slate-600 max-w-xs">
                Launch your first AI-powered marketing campaign and watch 8 agents work in parallel
              </p>
            </div>
            <Link
              to="/campaigns/new"
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-[13px] font-bold"
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                color: "white",
                boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              <Zap className="w-4 h-4" /> Launch Your First Campaign
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
