import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  InvoiceDetail,
  InvoiceListResponse,
  InvoicePdf,
  InvoiceStatusFilter,
} from "@/lib/types/entities";

export interface InvoiceListParams {
  month?: string; // YYYY-MM
  status?: InvoiceStatusFilter;
  page?: number;
  limit?: number;
}

export const invoiceKeys = {
  all: ["invoices"] as const,
  list: (params: InvoiceListParams) => ["invoices", "list", params] as const,
  detail: (id: string) => ["invoices", "detail", id] as const,
  pdf: (id: string) => ["invoices", "pdf", id] as const,
};

export function useInvoices(params: InvoiceListParams = {}) {
  return useQuery({
    queryKey: invoiceKeys.list(params),
    queryFn: () => apiClient.get<InvoiceListResponse>("/billing/invoices", params),
  });
}

export function useInvoice(invoiceId: string) {
  return useQuery({
    queryKey: invoiceKeys.detail(invoiceId),
    queryFn: () => apiClient.get<InvoiceDetail>(`/billing/invoices/${invoiceId}`),
    enabled: Boolean(invoiceId),
  });
}

export function useInvoicePdf(invoiceId: string) {
  return useQuery({
    queryKey: invoiceKeys.pdf(invoiceId),
    queryFn: () => apiClient.get<InvoicePdf>(`/billing/invoices/${invoiceId}/pdf`),
    enabled: Boolean(invoiceId),
  });
}
