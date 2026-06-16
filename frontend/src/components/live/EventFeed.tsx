import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCampaignStore } from "@/store/campaignStore";
import { Terminal, Wifi } from "lucide-react";

const TYPE_STYLE: Record<string, { color: string; bg: string; label: string }> = {
  CAMPAIGN_CREATED: { color: "#22d3ee", bg: "rgba(34,211,238,0.08)",  label: "NEW"   },
  STATE_CHANGED:    { color: "#a78bfa", bg: "rgba(167,139,250,0.08)", label: "STATE" },
  AGENT_UPDATE:     { color: "#6366f1", bg: "rgba(99,102,241,0.08)",  label: "AGENT" },
  AGENT_STARTED:    { color: "#818cf8", bg: "rgba(99,102,241,0.06)",  label: "START" },
  AGENT_COMPLETED:  { color: "#10b981", bg: "rgba(16,185,129,0.08)",  label: "DONE"  },
  AGENT_FAILED:     { color: "#f43f5e", bg: "rgba(244,63,94,0.08)",   label: "FAIL"  },
  REPORT_GENERATED: { color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  label: "PDF"   },
  MEMORY_UPDATED:   { color: "#8b5cf6", bg: "rgba(139,92,246,0.08)",  label: "MEM"   },
  SYSTEM_ERROR:     { color: "#f43f5e", bg: "rgba(244,63,94,0.08)",   label: "ERR"   },
  DEFAULT:          { color: "#475569", bg: "rgba(71,85,105,0.05)",   label: "LOG"   },
};

export function EventFeed() {
  const { events } = useCampaignStore();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events]);

  const visible = events.filter((e) => (e as any).type !== "HEARTBEAT").slice(-50);

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(8,13,26,0.97) 0%, rgba(5,8,17,0.99) 100%)",
        border: "1px solid rgba(99,102,241,0.1)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
        height: "100%",
        minHeight: "260px",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5" style={{ color: "#6366f1" }} />
          <span className="text-[11px] font-bold tracking-[0.1em] uppercase" style={{ color: "#6366f1", fontFamily: "'Space Grotesk', sans-serif" }}>
            Event Log
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Wifi className="w-3 h-3" style={{ color: "#10b981" }} />
          <span className="text-[10px] font-semibold text-emerald-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>LIVE</span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>

      {/* Events list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-8">
            <Terminal className="w-6 h-6 text-slate-800" />
            <p className="text-[11px] text-slate-700">Waiting for events...</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {visible.map((ev: any, i) => {
              const s = TYPE_STYLE[(ev.type as string)] ?? TYPE_STYLE.DEFAULT;
              const time = new Date(ev.timestamp).toLocaleTimeString("en-US", {
                hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit",
              });

              return (
                <motion.div
                  key={ev.event_id ?? ev.id ?? i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-start gap-2 px-2.5 py-1.5 rounded-lg transition-colors"
                  style={{ background: i === visible.length - 1 ? s.bg : "transparent" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = s.bg; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = i === visible.length - 1 ? s.bg : "transparent"; }}
                >
                  <div
                    className="flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5 text-center"
                    style={{
                      color: s.color,
                      background: `${s.color}18`,
                      border: `1px solid ${s.color}30`,
                      minWidth: "36px",
                    }}
                  >
                    {s.label}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] leading-tight" style={{ color: s.color, opacity: 0.9 }}>
                      {ev.message || ev.type}
                    </p>
                    {ev.agent && (
                      <p className="text-[9px] text-slate-700 mt-0.5">{ev.agent}</p>
                    )}
                  </div>

                  <span className="text-[9px] text-slate-700 flex-shrink-0 mt-0.5">{time}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
