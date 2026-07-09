"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ActiveCampaignsResponse, MarketingMessagesResponse } from "@/lib/types/entities";

export const campaignKeys = {
  all: ["campaigns"] as const,
  active: () => ["campaigns", "active"] as const,
  messages: () => ["campaigns", "messages"] as const,
};

export function useActiveCampaigns() {
  return useQuery({
    queryKey: campaignKeys.active(),
    queryFn: () => apiClient.get<ActiveCampaignsResponse>("/campaigns"),
  });
}

export function useMarketingMessages() {
  return useQuery({
    queryKey: campaignKeys.messages(),
    queryFn: () => apiClient.get<MarketingMessagesResponse>("/campaigns/messages"),
  });
}
