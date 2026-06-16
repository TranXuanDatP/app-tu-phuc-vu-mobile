"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, FolderOpen } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Badge,
} from "@/components/ui";
import { EmptyState, ErrorState } from "@/components/state";
import { useCategories, useSearchArticles } from "@/features/knowledge-base/queries";

export default function KnowledgeBasePage() {
  return (
    <Suspense fallback={<div className="h-48" />}>
      <KbPage />
    </Suspense>
  );
}

function KbPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "all";
  const [query, setQuery] = useState(q);

  const categories = useCategories();
  const search = useSearchArticles({
    q,
    category: category === "all" ? undefined : category,
    page: 1,
    pageSize: 20,
  });

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (category !== "all") params.set("category", category);
    router.replace(`/knowledge-base?${params.toString()}`);
  }

  function setCategory(v: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (q) params.set("q", q);
    if (v === "all") params.delete("category");
    else params.set("category", v);
    router.replace(`/knowledge-base?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Câu hỏi thường gặp</h1>
        <p className="text-sm text-muted-foreground">Tìm nhanh câu trả lời cho các vấn đề thường gặp</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={submitSearch} className="flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder="Nhập từ khoá tìm kiếm..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
            />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.data?.categories.map((c) => (
                  <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button type="submit" className="sr-only">Tìm</button>
          </form>
        </CardContent>
      </Card>

      {!q ? (
        // No search yet → show categories grid
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderOpen className="h-4 w-4" /> Danh mục
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categories.isLoading ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : categories.isError ? (
              <ErrorState onRetry={() => categories.refetch()} />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categories.data?.categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCategory(c.slug)}
                    className="rounded-lg border p-4 text-left transition-colors hover:bg-accent"
                  >
                    <p className="font-medium">{c.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{c.articleCount} bài viết</p>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Search className="h-4 w-4" /> Kết quả cho “{q}”
            </CardTitle>
          </CardHeader>
          <CardContent>
            {search.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : search.isError ? (
              <ErrorState onRetry={() => search.refetch()} />
            ) : !search.data?.articles.length ? (
              <EmptyState title="Không tìm thấy bài viết phù hợp" description="Thử từ khoá khác." />
            ) : (
              <div className="space-y-2">
                {search.data.articles.map((a) => (
                  <Link
                    key={a.id}
                    href={`/knowledge-base/${a.id}`}
                    className="block rounded-lg border p-4 transition-colors hover:bg-accent"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{a.title}</p>
                      {a.relevanceScore != null && (
                        <Badge variant="secondary">{Math.round(a.relevanceScore * 100)}%</Badge>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{a.summary}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{a.category}</p>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
