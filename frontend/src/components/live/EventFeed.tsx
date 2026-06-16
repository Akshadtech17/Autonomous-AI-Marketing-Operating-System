import { motion, AnimatePresence } from "framer-motion";
import { useCampaignStore } from "@/store/campaignStore";
import { formatDistanceToNow } from "date-fns";

const EVENT_COLORS: Record<string, string> = {
  CAMPAIGN_CREATED:  "text-blue-400 bg-blue-400/10",
  STATE_CHANGED:     "text-yellow-400 bg-yellow-400/10",
  AGENT_STARTED:     "text-indigo-400 bg-indigo-400/10",
  AGENT_UPDATE:      "text-purple-400 bg-purple-400/10",
  AGENT_COMPLETED:   "text-green-400 bg-green-400/10",
  AGENT_FAILED:      "text-red-400 bg-red-400/10",
  MEMORY_UPDATED:    "text-cyan-400 bg-cyan-400/10",
  REPORT_GENERATED:  "text-emerald-400 bg-emerald-400/10",
  SYSTEM_ERROR:      "text-red-400 bg-red-400/10",
};

export function EventFeed() {
  const { events } = useCampaignStore();

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Live Event Feed</h3>
        <div className="flex items-center gap-1.5">
          <div className="status-dot bg-green-400" />
          <span className="text-xs text-slate-400">Live</span>
        </div>
      </div>
      <div className="h-80 overflow-y-auto p-3 space-y-2 font-mono">
        <AnimatePresence initial={false}>
          {events.map((event) => {
            const colorClass = EVENT_COLORS[event.type] ?? "text-slate-400 bg-slate-400/10";
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-2 text-xs"
              >
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex-shrink-0 ${colorClass}`}>
                  {event.type.replace(/_/g, " ")}
                </span>
                {event.agent && (
                  <span className="text-indigo-400 flex-shrink-0">[{event.agent}]</span>
                )}
                <span className="text-slate-300 flex-1 truncate">{event.message}</span>
                <span className="text-slate-600 flex-shrink-0">
                  {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                </span>
              </motion.div>
            );
          })}
          {events.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-600 text-xs">Waiting for events...</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
