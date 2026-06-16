"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ThumbsUp, ThumbsDown } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@/components/ui";
import { ErrorState } from "@/components/state";
import { useArticle, useRateArticle } from "@/features/knowledge-base/queries";
import { formatDate } from "@/lib/utils";

export default function KbArticlePage({
  params,
}: {
  params: Promise<{ articleId: string }>;
}) {
  const { articleId } = use(params);
  const router = useRouter();
  const article = useArticle(articleId);
  const rate = useRateArticle();
  const [voted, setVoted] = useState<boolean | null>(null);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1">
        <ArrowLeft className="h-4 w-4" /> Quay lại
      </Button>

      {article.isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : article.isError ? (
        <Card><CardContent><ErrorState onRetry={() => article.refetch()} /></CardContent></Card>
      ) : !article.data ? null : (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{article.data.category}</Badge>
              <span className="text-xs text-muted-foreground">
                Cập nhật {formatDate(article.data.updatedAt)} · {article.data.author}
              </span>
            </div>
            <CardTitle className="text-xl">{article.data.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none whitespace-pre-line text-sm leading-relaxed text-foreground">
              {article.data.content}
            </div>

            <div className="mt-8 border-t pt-4">
              <p className="mb-3 text-sm font-medium">Bài viết này có hữu ích không?</p>
              {voted !== null ? (
                <p className="text-sm text-muted-foreground">Cảm ơn phản hồi của bạn!</p>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={rate.isPending}
                    onClick={() => {
                      setVoted(true);
                      rate.mutate({ articleId, helpful: true });
                    }}
                    className="gap-1"
                  >
                    <ThumbsUp className="h-4 w-4" /> Có
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={rate.isPending}
                    onClick={() => {
                      setVoted(false);
                      rate.mutate({ articleId, helpful: false });
                    }}
                    className="gap-1"
                  >
                    <ThumbsDown className="h-4 w-4" /> Không
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
