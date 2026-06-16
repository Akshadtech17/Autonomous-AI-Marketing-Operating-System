import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Zap, Loader2 } from "lucide-react";
import { api, CreateCampaignPayload } from "@/services/api";
import { useCampaignStore } from "@/store/campaignStore";

const INDUSTRIES = [
  "Technology", "E-commerce", "Healthcare", "Finance", "Education",
  "Real Estate", "Food & Beverage", "Fashion", "Travel", "SaaS",
  "Consulting", "Media & Entertainment", "Non-profit", "Other",
];

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

  const set = (k: keyof CreateCampaignPayload, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

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
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={submit}
      className="glass p-8 rounded-2xl max-w-2xl mx-auto space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold gradient-text mb-1">Launch Campaign</h2>
        <p className="text-slate-400 text-sm">AI agents will autonomously build your marketing strategy</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Business Name *</label>
          <input
            required
            value={form.business_name}
            onChange={(e) => set("business_name", e.target.value)}
            placeholder="Acme Corporation"
            className="mt-1.5 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Industry *</label>
          <select
            required
            value={form.industry}
            onChange={(e) => set("industry", e.target.value)}
            className="mt-1.5 w-full bg-[#0f1729] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all"
          >
            <option value="">Select industry</option>
            {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Location *</label>
          <input
            required
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="New York, USA"
            className="mt-1.5 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all"
          />
        </div>

        <div className="col-span-2">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Campaign Goal *</label>
          <textarea
            required
            rows={3}
            value={form.goal}
            onChange={(e) => set("goal", e.target.value)}
            placeholder="Increase brand awareness by 40% in Q1, generate 500 qualified leads per month..."
            className="mt-1.5 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Target Audience</label>
          <input
            value={form.target_audience}
            onChange={(e) => set("target_audience", e.target.value)}
            placeholder="25-45 year old professionals"
            className="mt-1.5 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Monthly Budget</label>
          <input
            value={form.budget}
            onChange={(e) => set("budget", e.target.value)}
            placeholder="$5,000 / month"
            className="mt-1.5 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm hover:from-indigo-400 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Launching AI Agents...</>
        ) : (
          <><Zap className="w-4 h-4" /> Launch Campaign</>
        )}
      </button>
    </motion.form>
  );
}
