"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/types/api";
import type {
  KbArticleDetail,
  KbArticleSummary,
  KbCategory,
  KbRateResponse,
} from "@/lib/types/entities";

export const kbKeys = {
  all: ["kb"] as const,
  categories: () => ["kb", "categories"] as const,
  search: (params: { q: string; category?: string; page?: number; pageSize?: number }) =>
    ["kb", "search", params] as const,
  article: (id: string) => ["kb", "article", id] as const,
};

interface CategoriesResponse {
  categories: KbCategory[];
}
interface SearchResponse {
  articles: KbArticleSummary[];
  total: number;
  query: string;
}

export function useCategories() {
  return useQuery({
    queryKey: kbKeys.categories(),
    queryFn: () => apiClient.get<CategoriesResponse>("/knowledge-base/categories"),
  });
}

export function useSearchArticles(params: {
  q: string;
  category?: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: kbKeys.search(params),
    queryFn: () => apiClient.get<SearchResponse>("/knowledge-base/search", params),
    enabled: params.q.trim().length > 0,
  });
}

export function useArticle(id: string) {
  return useQuery({
    queryKey: kbKeys.article(id),
    queryFn: () => apiClient.get<KbArticleDetail>(`/knowledge-base/articles/${id}`),
    enabled: Boolean(id),
  });
}

export function useRateArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ articleId, helpful }: { articleId: string; helpful: boolean }) =>
      apiClient.post<KbRateResponse>(`/knowledge-base/articles/${articleId}/rate`, { helpful }),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: kbKeys.article(vars.articleId) });
      toast.success(vars.helpful ? "Cảm ơn phản hồi!" : "Chúng tôi sẽ cải thiện nội dung này.");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}
