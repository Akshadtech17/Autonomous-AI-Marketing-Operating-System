import { useEffect, useRef } from "react";
import { CampaignWebSocket, SystemEvent } from "@/services/websocket";
import { useCampaignStore } from "@/store/campaignStore";

export function useCampaignWebSocket(campaignId: string | null) {
  const wsRef = useRef<CampaignWebSocket | null>(null);
  const { updateAgentProgress, updateCampaignStatus, addEvent } = useCampaignStore();

  useEffect(() => {
    if (!campaignId) return;

    wsRef.current = new CampaignWebSocket(campaignId);

    const unsub = wsRef.current.subscribe((event: SystemEvent) => {
      if (event.type === "HEARTBEAT") return;

      addEvent({
        id: event.event_id,
        type: event.type,
        agent: event.agent,
        message: event.message,
        timestamp: event.timestamp,
      });

      if (event.type === "AGENT_UPDATE" && event.agent) {
        updateAgentProgress(
          event.agent,
          event.state ?? "RUNNING",
          event.progress ?? 0,
          event.message,
        );
      }

      if (event.type === "STATE_CHANGED" && event.state) {
        updateCampaignStatus(campaignId, event.state);
      }
    });

    return () => {
      unsub();
      wsRef.current?.destroy();
    };
  }, [campaignId]);
}

export function useGlobalWebSocket() {
  const wsRef = useRef<CampaignWebSocket | null>(null);
  const { updateCampaignStatus, addEvent } = useCampaignStore();

  useEffect(() => {
    wsRef.current = new CampaignWebSocket("global");

    const unsub = wsRef.current.subscribe((event: SystemEvent) => {
      if (event.type === "HEARTBEAT") return;
      if (event.campaign_id && event.state) {
        updateCampaignStatus(event.campaign_id, event.state);
      }
      addEvent({
        id: event.event_id,
        type: event.type,
        agent: event.agent,
        message: event.message,
        timestamp: event.timestamp,
      });
    });

    return () => {
      unsub();
      wsRef.current?.destroy();
    };
  }, []);
}
