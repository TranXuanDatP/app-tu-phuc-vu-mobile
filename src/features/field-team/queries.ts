"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface TeamEta {
  ticketId: string;
  teamId: string;
  etaMinutes: number;
  status: string;
}
export interface TeamLocation {
  ticketId: string;
  teamId: string;
  latitude: number;
  longitude: number;
  updatedAt: string;
}

export function useTeamEta(ticketId: string) {
  return useQuery({
    queryKey: ["field-team", ticketId, "eta"],
    queryFn: () => apiClient.get<TeamEta>(`/field-team/${ticketId}/eta`),
    enabled: Boolean(ticketId),
  });
}

export function useTeamLocation(ticketId: string) {
  return useQuery({
    queryKey: ["field-team", ticketId, "location"],
    queryFn: () => apiClient.get<TeamLocation>(`/field-team/${ticketId}/location`),
    enabled: Boolean(ticketId),
  });
}
