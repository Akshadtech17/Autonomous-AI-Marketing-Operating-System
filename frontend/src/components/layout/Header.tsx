import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, Command } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCampaignStore } from "@/store/campaignStore";

export function Header({ title }: { title: string }) {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { campaigns } = useCampaignStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
      if (e.key === "Escape") setCmdOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const filtered = campaigns.filter((c) =>
    c.business_name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <header className="h-16 border-b border-white/10 bg-black/10 backdrop-blur-sm flex items-center justify-between px-6">
        <h1 className="text-lg font-semibold text-white">{title}</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCmdOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-400 bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            <Command className="w-3.5 h-3.5" />
            <span>Search</span>
            <kbd className="text-xs bg-white/10 px-1.5 py-0.5 rounded">⌘K</kbd>
          </button>
          <button className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
            <Bell className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {cmdOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24"
            onClick={() => setCmdOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
              className="w-full max-w-lg glass border border-white/20 rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 p-4 border-b border-white/10">
                <Search className="w-4 h-4 text-indigo-400" />
                <input
                  autoFocus
                  placeholder="Search campaigns, agents..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-sm"
                />
              </div>
              <div className="max-h-64 overflow-y-auto">
                {filtered.slice(0, 5).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { navigate(`/campaigns/${c.id}`); setCmdOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-left"
                  >
                    <div className="w-2 h-2 rounded-full bg-indigo-400" />
                    <div>
                      <p className="text-sm text-white">{c.business_name}</p>
                      <p className="text-xs text-slate-500">{c.status}</p>
                    </div>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <p className="text-center text-slate-500 text-sm py-8">No campaigns found</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
