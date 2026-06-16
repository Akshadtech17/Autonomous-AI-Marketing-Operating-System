const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

export const api = {
  campaigns: {
    list: () => request<Campaign[]>("/campaign/"),
    create: (data: CreateCampaignPayload) =>
      request<Campaign>("/campaign/create", { method: "POST", body: JSON.stringify(data) }),
    get: (id: string) => request<Campaign>(`/campaign/${id}/status`),
    run: (id: string) => request<{ message: string }>(`/campaign/${id}/run`, { method: "POST" }),
    logs: (id: string) => request<AgentLog[]>(`/campaign/${id}/logs`),
  },
  agents: {
    status: () => request<{ agents: AgentInfo[] }>("/agents/status"),
    logs: (campaignId: string) => request<AgentLog[]>(`/agents/logs/${campaignId}`),
  },
  reports: {
    generate: (id: string) => request<{ path: string }>(`/report/${id}/generate`, { method: "POST" }),
    download: (id: string) => `${BASE}/report/${id}`,
  },
};

export interface CreateCampaignPayload {
  business_name: string;
  industry: string;
  location: string;
  goal: string;
  target_audience?: string;
  budget?: string;
}

export interface Campaign {
  id: string;
  business_name: string;
  industry: string;
  location: string;
  goal: string;
  target_audience?: string;
  budget?: string;
  status: CampaignStatus;
  dag?: Record<string, unknown>;
  agent_outputs?: Record<string, AgentOutput>;
  report_path?: string;
  error_message?: string;
  created_at: string;
  updated_at?: string;
  completed_at?: string;
}

export interface AgentOutput {
  agent: string;
  task_id: string;
  input_summary: string;
  output: string;
  key_insights: string[];
  confidence_score: number;
  timestamp: string;
}

export interface AgentLog {
  id: string;
  campaign_id: string;
  agent_name: string;
  task_id: string;
  state: string;
  confidence_score?: number;
  retry_count: number;
  error_message?: string;
  duration_ms?: number;
  model_used?: string;
  timestamp: string;
  completed_at?: string;
}

export interface AgentInfo {
  name: string;
  role: string;
  type: string;
}

export type CampaignStatus =
  | "CREATED" | "PLANNING" | "RUNNING_RESEARCH" | "RUNNING_SEO"
  | "RUNNING_CONTENT" | "RUNNING_SOCIAL" | "RUNNING_ANALYTICS"
  | "REVIEW" | "REPORT_GENERATION" | "COMPLETED" | "FAILED";
