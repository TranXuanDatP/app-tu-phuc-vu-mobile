import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  ContractDetail,
  ContractListResponse,
  ContractPdf,
  ContractStatus,
  ContractVersionsResponse,
} from "@/lib/types/entities";

export interface ContractListParams {
  status?: ContractStatus;
}

export const contractKeys = {
  all: ["contracts"] as const,
  list: (params: ContractListParams) => ["contracts", "list", params] as const,
  detail: (id: string) => ["contracts", "detail", id] as const,
  versions: (id: string) => ["contracts", "versions", id] as const,
  pdf: (id: string) => ["contracts", "pdf", id] as const,
};

export function useContracts(params: ContractListParams = {}) {
  return useQuery({
    queryKey: contractKeys.list(params),
    queryFn: () => apiClient.get<ContractListResponse>("/contracts", params),
  });
}

export function useContract(contractId: string) {
  return useQuery({
    queryKey: contractKeys.detail(contractId),
    queryFn: () => apiClient.get<ContractDetail>(`/contracts/${contractId}`),
    enabled: Boolean(contractId),
  });
}

export function useContractVersions(contractId: string) {
  return useQuery({
    queryKey: contractKeys.versions(contractId),
    queryFn: () => apiClient.get<ContractVersionsResponse>(`/contracts/${contractId}/versions`),
    enabled: Boolean(contractId),
  });
}

export function useContractPdf(contractId: string) {
  return useQuery({
    queryKey: contractKeys.pdf(contractId),
    queryFn: () => apiClient.get<ContractPdf>(`/contracts/${contractId}/pdf`),
    enabled: Boolean(contractId),
  });
}
