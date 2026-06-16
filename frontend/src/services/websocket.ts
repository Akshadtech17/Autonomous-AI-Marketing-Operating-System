const WS_BASE = import.meta.env.VITE_WS_URL ?? "ws://localhost:8000";

export interface SystemEvent {
  event_id: string;
  campaign_id?: string;
  type: string;
  agent?: string;
  state?: string;
  progress?: number;
  message: string;
  data?: unknown;
  timestamp: string;
}

type EventHandler = (event: SystemEvent) => void;

export class CampaignWebSocket {
  private ws: WebSocket | null = null;
  private handlers: Set<EventHandler> = new Set();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private url: string;
  private destroyed = false;

  constructor(campaignId: string | "global") {
    this.url = campaignId === "global"
      ? `${WS_BASE}/ws/global`
      : `${WS_BASE}/ws/campaign/${campaignId}`;
    this.connect();
  }

  private connect() {
    if (this.destroyed) return;
    this.ws = new WebSocket(this.url);

    this.ws.onmessage = (e) => {
      try {
        const event: SystemEvent = JSON.parse(e.data);
        this.handlers.forEach((h) => h(event));
      } catch {
        // ignore malformed frames
      }
    };

    this.ws.onclose = () => {
      if (!this.destroyed) {
        this.reconnectTimer = setTimeout(() => this.connect(), 3000);
      }
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  subscribe(handler: EventHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  destroy() {
    this.destroyed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.handlers.clear();
  }
}
