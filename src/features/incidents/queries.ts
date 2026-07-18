import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import { apiClient } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/types/api";

// ── Types (match backend report/incident mock — source of truth) ──────────────
export interface IncidentReport {
  reportId: string;
  customerId: string;
  type: string;
  description: string;
  photoUrls: string[];
  location: { lat: number; lng: number; address: string; area: string | null };
  status: string;
  incidentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReportDetail extends IncidentReport {
  incidentSummary: {
    incidentId: string;
    type: string;
    status: string;
    severity: string;
    affectedCustomers: number;
    assignedTeam: string | null;
  } | null;
}

export interface CreateReportResult {
  reportId: string;
  status: string;
  incidentId: string | null;
  message: string;
}

export interface CreateReportInput {
  type: string;
  description: string;
  photoUrls?: string[];
  location: { lat: number; lng: number; address: string; area: string | null };
}

// ── Query keys ────────────────────────────────────────────────────────────────
export const reportKeys = {
  all: ["incident-reports"] as const,
  my: (status?: string) => ["incident-reports", "my", status] as const,
  detail: (id: string) => ["incident-reports", id] as const,
};

// ── Hooks ─────────────────────────────────────────────────────────────────────
export function useMyReports(status?: string) {
  return useQuery({
    queryKey: reportKeys.my(status),
    queryFn: () =>
      apiClient.get<{ reports: IncidentReport[]; totalCount: number }>(
        "/incidents/reports",
        status ? { status } : undefined,
      ),
  });
}

export function useReportDetail(reportId: string) {
  return useQuery({
    queryKey: reportKeys.detail(reportId),
    queryFn: () => apiClient.get<ReportDetail>(`/incidents/reports/${reportId}`),
    enabled: Boolean(reportId),
  });
}

export function useCreateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReportInput) =>
      apiClient.post<CreateReportResult>("/incidents/reports", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: reportKeys.all }),
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

/**
 * Upload photo. RN-correct: asset {uri, name, type} (NOT web File/Blob); the PUT
 * body is the RN file object (fetch reads it via uri). Content-Type is set to match
 * the presigned URL's expected type (single-file PUT, not FormData — so setting
 * Content-Type is correct, unlike multipart).
 *
 * Graceful fallback: the BFF's document module was removed in the lean restructure,
 * so /documents/upload-url currently 404s → fall back to the local asset uri so
 * create-report still works (photoUrls = [localUri]). When the document service is
 * restored, the real upload + fileKey take effect with no mobile change.
 */
export function useUploadReportPhoto() {
  return useMutation({
    mutationFn: async ({
      asset,
    }: {
      asset: { uri: string; name?: string; type?: string };
    }) => {
      try {
        const fileName = asset.name ?? "photo.jpg";
        const fileType = (asset.type ?? "image/jpeg") as "image/jpeg" | "image/png" | "image/webp";
        const { uploadUrl, fileKey } = await apiClient.post<{
          uploadUrl: string;
          fileKey: string;
        }>("/documents/upload-url", { fileName, fileType });
        const putRes = await fetch(uploadUrl, {
          method: "PUT",
          body: { uri: asset.uri, type: fileType, name: fileName } as unknown as BodyInit,
          headers: { "Content-Type": fileType },
        });
        if (!putRes.ok) throw new Error("Tải ảnh lên thất bại");
        return { fileKey, publicUrl: uploadUrl.split("?")[0] };
      } catch {
        // Document-service unavailable → use local asset uri.
        return { fileKey: `local:${asset.uri}`, publicUrl: asset.uri };
      }
    },
    onError: (e) => toast.error((e as Error).message ?? "Tải ảnh lên thất bại"),
  });
}
