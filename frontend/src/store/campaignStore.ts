import { create } from "zustand";
import { Campaign } from "@/services/api";

interface CampaignStore {
  campaigns: Campaign[];
  activeCampaign: Campaign | null;
  agentProgress: Record<string, { state: string; progress: number; message: string; confidence_score?: number }>;
  events: Array<{ id: string; type: string; agent?: string; message: string; timestamp: string }>;

  setCampaigns: (campaigns: Campaign[]) => void;
  setActiveCampaign: (c: Campaign | null) => void;
  updateCampaignStatus: (id: string, status: string) => void;
  updateAgentProgress: (agent: string, state: string, progress: number, message: string) => void;
  addEvent: (event: { id: string; type: string; agent?: string; message: string; timestamp: string }) => void;
  clearEvents: () => void;
}

export const useCampaignStore = create<CampaignStore>((set) => ({
  campaigns: [],
  activeCampaign: null,
  agentProgress: {},
  events: [],

  setCampaigns: (campaigns) => set({ campaigns }),
  setActiveCampaign: (c) => set({ activeCampaign: c, agentProgress: {}, events: [] }),

  updateCampaignStatus: (id, status) =>
    set((s) => ({
      campaigns: s.campaigns.map((c) => c.id === id ? { ...c, status: status as Campaign["status"] } : c),
      activeCampaign: s.activeCampaign?.id === id
        ? { ...s.activeCampaign, status: status as Campaign["status"] }
        : s.activeCampaign,
    })),

  updateAgentProgress: (agent, state, progress, message) =>
    set((s) => ({
      agentProgress: { ...s.agentProgress, [agent]: { state, progress, message } },
    })),

  addEvent: (event) =>
    set((s) => ({ events: [event, ...s.events].slice(0, 100) })),

  clearEvents: () => set({ events: [] }),
}));
