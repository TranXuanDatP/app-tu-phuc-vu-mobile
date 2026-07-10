"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/types/api";

export interface CreateSurveyResult {
  surveyId: string;
  status: string;
}

export function useCreateSurvey() {
  return useMutation({
    mutationFn: (input: { address: string; purpose: string }) =>
      apiClient.post<CreateSurveyResult>("/site-surveys", input),
    onSuccess: () => toast.success("Đã tạo yêu cầu khảo sát"),
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}
