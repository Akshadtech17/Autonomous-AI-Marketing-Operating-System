import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, ChevronRight, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCampaignStore } from "@/store/campaignStore";
import { useUIStore } from "@/store/uiStore";

const STATUS_COLOR: Record<string, string> = {
  COMPLETED: "#10b981",
  FAILED: "#f43f5e",
  RUNNING_RESEARCH: "#22d3ee",
  RUNNING_SEO: "#10b981",
  RUNNING_CONTENT: "#a78bfa",
  RUNNING_SOCIAL: "#f472b6",
  RUNNING_ANALYTICS: "#f59e0b",
  PLANNING: "#f59e0b",
  CREATED: "#475569",
  DEFAULT: "#6366f1",
};

export function Header({ title }: { title: string }) {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { campaigns } = useCampaignStore();
  const { toggleSidebar } = useUIStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmdOpen((o) => !o); }
      if (e.key === "Escape") setCmdOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const filtered = campaigns.filter((c) =>
    c.business_name.toLowerCase().includes(query.toLowerCase())
  );

  const running = campaigns.filter((c) => !["COMPLETED","FAILED","CREATED"].includes(c.status)).length;

  return (
    <>
      <header
        className="h-14 flex items-center justify-between px-3 md:px-6 relative z-10 flex-shrink-0"
        style={{
          background: "rgba(5,8,17,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(99,102,241,0.1)",
        }}
      >
        {/* Left: hamburger (mobile) + title breadcrumb */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Hamburger — mobile only */}
          <button
            onClick={toggleSidebar}
            className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <Menu className="w-4 h-4 text-slate-400" />
          </button>

          <span className="hidden sm:inline text-[11px] font-semibold tracking-widest uppercase flex-shrink-0" style={{ color: "#334155", fontFamily: "'Space Grotesk', sans-serif" }}>
            LIF
          </span>
          <ChevronRight className="hidden sm:block w-3 h-3 text-slate-700 flex-shrink-0" />
          <h1
            className="text-[14px] md:text-[15px] font-bold tracking-tight truncate"
            style={{ fontFamily: "'Syne', sans-serif", color: "#f1f5f9" }}
          >
            {title}
          </h1>
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-2">
          {/* Running badge */}
          {running > 0 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1.5 px-2 py-1 rounded-full"
              style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-semibold text-emerald-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                <span className="hidden sm:inline">{running} running</span>
                <span className="sm:hidden">{running}</span>
              </span>
            </motion.div>
          )}

          {/* Search */}
          <button
            onClick={() => setCmdOpen(true)}
            className="flex items-center gap-2 px-2.5 md:px-3 py-1.5 rounded-lg text-[12px] transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              color: "#64748b",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.1)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(99,102,241,0.25)";
              (e.currentTarget as HTMLElement).style.color = "#818cf8";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
              (e.currentTarget as HTMLElement).style.color = "#64748b";
            }}
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search</span>
            <kbd
              className="hidden md:inline text-[10px] px-1 py-0.5 rounded"
              style={{ background: "rgba(255,255,255,0.06)", color: "#475569" }}
            >
              ⌘K
            </kbd>
          </button>

          {/* Bell */}
          <button
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(99,102,241,0.3)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)"; }}
          >
            <Bell className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      </header>

      {/* Command palette */}
      <AnimatePresence>
        {cmdOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-16 md:pt-20"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
            onClick={() => setCmdOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.94, y: -16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: -16 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="w-full max-w-lg overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(12,19,37,0.98) 0%, rgba(8,13,26,0.99) 100%)",
                border: "1px solid rgba(99,102,241,0.25)",
                borderRadius: "16px",
                boxShadow: "0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(99,102,241,0.1), 0 0 40px rgba(99,102,241,0.1)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search bar */}
              <div
                className="flex items-center gap-3 px-4 py-3.5"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(99,102,241,0.15)" }}
                >
                  <Search className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <input
                  autoFocus
                  placeholder="Search campaigns..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent text-[13px] text-white placeholder-slate-600 outline-none"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                />
                <kbd className="text-[10px] px-1.5 py-0.5 rounded text-slate-600" style={{ background: "rgba(255,255,255,0.05)" }}>ESC</kbd>
              </div>

              {/* Results */}
              <div className="max-h-72 overflow-y-auto p-2">
                <p className="px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] uppercase text-slate-700" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Campaigns
                </p>
                {filtered.slice(0, 6).map((c, i) => {
                  const col = STATUS_COLOR[c.status] ?? STATUS_COLOR.DEFAULT;
                  return (
                    <motion.button
                      key={c.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => { navigate(`/campaigns/${c.id}`); setCmdOpen(false); setQuery(""); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 group"
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.08)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: `${col}15` }}>
                        <div className="w-2 h-2 rounded-full" style={{ background: col }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-slate-200 truncate">{c.business_name}</p>
                        <p className="text-[11px] text-slate-600 truncate">{c.industry} · {c.status.replace(/_/g, " ")}</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-700 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
                    </motion.button>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="flex flex-col items-center py-10 gap-2">
                    <p className="text-[13px] text-slate-600">No campaigns found</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
