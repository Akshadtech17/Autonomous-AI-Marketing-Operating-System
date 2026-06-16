import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Zap, Activity, FileText, BarChart3,
} from "lucide-react";

const NAV = [
  { to: "/",          icon: LayoutDashboard, label: "Dashboard",   color: "#6366f1", glow: "rgba(99,102,241,0.3)"  },
  { to: "/campaigns", icon: Zap,             label: "Campaigns",   color: "#22d3ee", glow: "rgba(34,211,238,0.3)"  },
  { to: "/monitor",   icon: Activity,        label: "Live Monitor",color: "#10b981", glow: "rgba(16,185,129,0.3)"  },
  { to: "/reports",   icon: FileText,        label: "Reports",     color: "#a78bfa", glow: "rgba(167,139,250,0.3)" },
  { to: "/analytics", icon: BarChart3,       label: "Analytics",   color: "#f59e0b", glow: "rgba(245,158,11,0.3)"  },
];

export function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside
      className="w-[220px] flex flex-col h-screen relative z-20 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, rgba(8,13,26,0.98) 0%, rgba(5,8,17,0.99) 100%)",
        borderRight: "1px solid rgba(99,102,241,0.1)",
      }}
    >
      {/* Ambient orb */}
      <div
        className="absolute top-0 left-0 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)", transform: "translate(-30%, -30%)" }}
      />

      {/* Brand */}
      <div className="px-5 pt-6 pb-5 relative">
        <div className="flex items-center gap-3">
          {/* Logo mark */}
          <div className="relative flex-shrink-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center relative z-10"
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #a78bfa 100%)",
                boxShadow: "0 0 20px rgba(99,102,241,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" fillOpacity="0.9" />
                <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.7" />
                <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div
              className="absolute inset-0 rounded-xl animate-pulse"
              style={{ background: "rgba(99,102,241,0.3)", filter: "blur(8px)", zIndex: 0 }}
            />
          </div>

          <div>
            <p
              className="text-[13px] font-bold leading-tight tracking-tight"
              style={{ fontFamily: "'Syne', sans-serif", color: "#f1f5f9" }}
            >
              Lost In Frame
            </p>
            <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "#6366f1", fontFamily: "'Space Grotesk', sans-serif" }}>
              AI Marketing OS
            </p>
          </div>
        </div>

        {/* Separator */}
        <div className="mt-5 h-px" style={{ background: "linear-gradient(90deg, rgba(99,102,241,0.3), rgba(167,139,250,0.2), transparent)" }} />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        <p className="px-3 mb-3 text-[9px] font-bold tracking-[0.18em] uppercase" style={{ color: "#334155", fontFamily: "'Space Grotesk', sans-serif" }}>
          Navigation
        </p>
        {NAV.map(({ to, icon: Icon, label, color, glow }) => {
          const active = pathname === to || (to !== "/" && pathname.startsWith(to));
          return (
            <Link key={to} to={to}>
              <motion.div
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.97 }}
                className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: active ? "#f1f5f9" : "#64748b",
                  background: active
                    ? `linear-gradient(135deg, ${color}18 0%, ${color}08 100%)`
                    : "transparent",
                  border: active ? `1px solid ${color}30` : "1px solid transparent",
                  boxShadow: active ? `0 0 12px ${glow}` : "none",
                }}
              >
                {/* Active indicator */}
                {active && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                    style={{ background: color, boxShadow: `0 0 8px ${color}` }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                {/* Icon container */}
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200"
                  style={{
                    background: active ? `${color}25` : "transparent",
                    boxShadow: active ? `0 0 10px ${glow}` : "none",
                  }}
                >
                  <Icon
                    className="w-3.5 h-3.5"
                    style={{ color: active ? color : "#475569" }}
                  />
                </div>

                <span className="leading-none">{label}</span>

                {active && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: color, boxShadow: `0 0 6px ${color}` }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom status */}
      <div className="px-4 pb-5 pt-4">
        <div className="h-px mb-4" style={{ background: "linear-gradient(90deg, rgba(99,102,241,0.2), transparent)" }} />
        <div
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
          style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.12)" }}
        >
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-40" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-emerald-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              System Online
            </p>
            <p className="text-[9px] text-slate-600 mt-0.5">All agents ready</p>
          </div>
        </div>

        <p
          className="text-center mt-3 text-[9px] tracking-widest uppercase"
          style={{ color: "#1e293b", fontFamily: "'Space Grotesk', sans-serif" }}
        >
          v1.0.0 · Groq API
        </p>
      </div>
    </aside>
  );
}
