import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Zap, Loader2, ChevronRight, Building2, Globe, Target, Users, DollarSign, Sparkles } from "lucide-react";
import { api, CreateCampaignPayload } from "@/services/api";
import { useCampaignStore } from "@/store/campaignStore";

const INDUSTRIES = [
  "Technology", "E-commerce", "Healthcare", "Finance", "Education",
  "Real Estate", "Food & Beverage", "Fashion", "Travel", "SaaS",
  "Consulting", "Media & Entertainment", "Non-profit", "Other",
];

const AGENT_PREVIEW = [
  { icon: "👑", label: "CEO",       color: "#a78bfa", delay: 0    },
  { icon: "🔬", label: "Research",  color: "#22d3ee", delay: 0.08 },
  { icon: "🎯", label: "SEO",       color: "#10b981", delay: 0.16 },
  { icon: "✍️", label: "Content",   color: "#f59e0b", delay: 0.24 },
  { icon: "📱", label: "Social",    color: "#f472b6", delay: 0.32 },
  { icon: "📊", label: "Analytics", color: "#fb923c", delay: 0.40 },
  { icon: "🎨", label: "Creative",  color: "#f43f5e", delay: 0.48 },
  { icon: "📋", label: "Report",    color: "#6366f1", delay: 0.56 },
];

function Field({ label, icon: Icon, children }: { label: string; icon?: any; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="field-label flex items-center gap-1.5">
        {Icon && <Icon className="w-3 h-3" style={{ color: "#6366f1" }} />}
        {label}
      </label>
      {children}
    </div>
  );
}

export function CampaignForm() {
  const navigate = useNavigate();
  const { setCampaigns, campaigns } = useCampaignStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<CreateCampaignPayload>({
    business_name: "",
    industry: "",
    location: "",
    goal: "",
    target_audience: "",
    budget: "",
  });

  const set = (k: keyof CreateCampaignPayload, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const campaign = await api.campaigns.create(form);
      setCampaigns([campaign, ...campaigns]);
      await api.campaigns.run(campaign.id);
      navigate(`/campaigns/${campaign.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Hero heading */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-7"
      >
        <div className="flex items-center gap-2 mb-3">
          <div
            className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase"
            style={{ background: "rgba(99,102,241,0.12)", color: "#6366f1", border: "1px solid rgba(99,102,241,0.2)", fontFamily: "'Space Grotesk', sans-serif" }}
          >
            AI Campaign Studio
          </div>
        </div>
        <h1
          className="text-[28px] font-bold leading-tight mb-2"
          style={{ fontFamily: "'Syne', sans-serif", color: "#f1f5f9" }}
        >
          Launch a New Campaign
        </h1>
        <p className="text-[13px] text-slate-500">
          8 AI agents will autonomously build your complete marketing strategy
        </p>
      </motion.div>

      {/* Agent pipeline preview */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 p-4 rounded-2xl overflow-hidden relative"
        style={{
          background: "linear-gradient(135deg, rgba(10,16,32,0.9) 0%, rgba(6,10,20,0.95) 100%)",
          border: "1px solid rgba(99,102,241,0.12)",
        }}
      >
        <p className="text-[10px] font-bold tracking-widest uppercase text-slate-600 mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Agent Pipeline — Auto-triggered on launch
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {AGENT_PREVIEW.map((a) => (
            <motion.div
              key={a.label}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: a.delay, type: "spring", stiffness: 300, damping: 20 }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
              style={{
                background: `${a.color}10`,
                border: `1px solid ${a.color}25`,
              }}
            >
              <span className="text-sm">{a.icon}</span>
              <span className="text-[11px] font-semibold" style={{ color: a.color, fontFamily: "'Space Grotesk', sans-serif" }}>
                {a.label}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        onSubmit={submit}
        className="space-y-5"
      >
        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 py-3 rounded-xl text-[12px]"
              style={{
                background: "rgba(244,63,94,0.08)",
                border: "1px solid rgba(244,63,94,0.25)",
                color: "#f43f5e",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(12,19,37,0.95) 0%, rgba(8,13,26,0.98) 100%)",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
          }}
        >
          {/* Section: Business */}
          <div className="p-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <p className="text-[10px] font-bold tracking-widest uppercase mb-4" style={{ color: "#6366f1", fontFamily: "'Space Grotesk', sans-serif" }}>
              Business Details
            </p>
            <div className="space-y-4">
              <Field label="Business Name *" icon={Building2}>
                <input
                  required
                  value={form.business_name}
                  onChange={(e) => set("business_name", e.target.value)}
                  placeholder="e.g. Acme Corporation"
                  className="field-input"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Industry *" icon={Sparkles}>
                  <select
                    required
                    value={form.industry}
                    onChange={(e) => set("industry", e.target.value)}
                    className="field-input"
                    style={{ background: "rgba(5,8,17,0.9)" }}
                  >
                    <option value="" disabled>Select industry</option>
                    {INDUSTRIES.map((i) => <option key={i} value={i} style={{ background: "#0c1325" }}>{i}</option>)}
                  </select>
                </Field>
                <Field label="Location *" icon={Globe}>
                  <input
                    required
                    value={form.location}
                    onChange={(e) => set("location", e.target.value)}
                    placeholder="New York, USA"
                    className="field-input"
                  />
                </Field>
              </div>
            </div>
          </div>

          {/* Section: Campaign */}
          <div className="p-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <p className="text-[10px] font-bold tracking-widest uppercase mb-4" style={{ color: "#22d3ee", fontFamily: "'Space Grotesk', sans-serif" }}>
              Campaign Brief
            </p>
            <div className="space-y-4">
              <Field label="Campaign Goal *" icon={Target}>
                <textarea
                  required
                  rows={3}
                  value={form.goal}
                  onChange={(e) => set("goal", e.target.value)}
                  placeholder="Increase brand awareness by 40% in Q1, generate 500 qualified leads per month..."
                  className="field-input resize-none"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Target Audience" icon={Users}>
                  <input
                    value={form.target_audience}
                    onChange={(e) => set("target_audience", e.target.value)}
                    placeholder="25–45 year old professionals"
                    className="field-input"
                  />
                </Field>
                <Field label="Monthly Budget" icon={DollarSign}>
                  <input
                    value={form.budget}
                    onChange={(e) => set("budget", e.target.value)}
                    placeholder="$5,000 / month"
                    className="field-input"
                  />
                </Field>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="p-5">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-[14px] font-bold transition-all duration-200 relative overflow-hidden"
              style={{
                background: loading
                  ? "rgba(99,102,241,0.3)"
                  : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #7c3aed 100%)",
                color: "white",
                fontFamily: "'Space Grotesk', sans-serif",
                boxShadow: loading ? "none" : "0 4px 24px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
                cursor: loading ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (!loading) (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(99,102,241,0.55), inset 0 1px 0 rgba(255,255,255,0.2)";
              }}
              onMouseLeave={(e) => {
                if (!loading) (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.15)";
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deploying AI Agents...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Launch Campaign
                  <ChevronRight className="w-4 h-4 ml-0.5" />
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-slate-700 mt-3">
              Powered by Groq API · Qwen3 8B / LLaMA 3.2
            </p>
          </div>
        </div>
      </motion.form>
    </div>
  );
}
