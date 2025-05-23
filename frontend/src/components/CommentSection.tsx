import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { CommentItem } from "./CommentItem";
import { CommentPagination } from "./CommentPagination";
import { CommentStats } from "./CommentStats";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SlidersHorizontal } from "lucide-react";
import { useComments } from "@/hooks/useComments";

const COMMENTS_PER_PAGE = 5;

interface CommentSectionProps {
  url: string;
}

export default function CommentSection({ url }: CommentSectionProps) {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<
    "published_at" | "like_count" | "sentiment"
  >("published_at");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [keyword, setKeyword] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("");
  const [minLikes, setMinLikes] = useState<number | null>(null);

  useEffect(() => {
    setPage(1);
    setSortBy("published_at");
    setSortOrder("desc");
    setKeyword("");
    setSentimentFilter("");
    setMinLikes(null);
  }, [url]);

  const {
    data: commentsResponse,
    isLoading,
    error,
    refetch,
  } = useComments(url, {
    offset: (page - 1) * COMMENTS_PER_PAGE,
    limit: COMMENTS_PER_PAGE,
    sortBy,
    sortOrder,
    sentiment: sentimentFilter || undefined,
    minLikes: minLikes || undefined,
    author: keyword || undefined,
  });

  const sentimentCounts = {
    positive: 0,
    neutral: 0,
    negative: 0,
    ambiguous: 0,
  };

  commentsResponse?.comments?.forEach(({ sentiment_label }) => {
    const label = sentiment_label.toLowerCase();
    if (label in sentimentCounts) {
      sentimentCounts[label as keyof typeof sentimentCounts]++;
    }
  });

  return (
    <section className="mt-8">
      {(commentsResponse?.comments?.length ?? 0) > 0 && (
        <CommentStats counts={sentimentCounts} />
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Comments</h2>
        <div className="flex items-center gap-4">
          <span className="text-gray-500 text-sm">
            {commentsResponse?.total_available ?? 0} comments available
          </span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" /> Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              {/* Same filters */}
              <div className="grid gap-2">
                <Label>Sort by</Label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="h-8 border rounded p-1"
                >
                  <option value="published_at">Date</option>
                  <option value="like_count">Likes</option>
                  <option value="sentiment">Sentiment</option>
                </select>
                <Label>Order</Label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="h-8 border rounded p-1"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
                <Label>Sentiment</Label>
                <select
                  value={sentimentFilter}
                  onChange={(e) => setSentimentFilter(e.target.value)}
                  className="h-8 border rounded p-1"
                >
                  <option value="">All</option>
                  <option value="positive">Positive</option>
                  <option value="negative">Negative</option>
                  <option value="neutral">Neutral</option>
                </select>
                <Label>Author</Label>
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="h-8"
                />
                <Label>Min Likes</Label>
                <Input
                  type="number"
                  min={0}
                  value={minLikes ?? ""}
                  onChange={(e) =>
                    setMinLikes(
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  className="h-8"
                />
                <Button onClick={() => refetch()}>Apply Filters</Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error.message}</p>}
      {!isLoading && commentsResponse?.comments?.length === 0 && (
        <p>No comments available.</p>
      )}

      <div className="space-y-3">
        {commentsResponse?.comments.map((comment) => (
          <CommentItem
            key={comment.comment_id}
            author={comment.author}
            text={comment.text}
            likeCount={comment.like_count}
            sentiment={comment.sentiment_label}
            publishedAt={comment.published_at}
          />
        ))}
      </div>

      {commentsResponse && (
        <CommentPagination
          page={page}
          totalPages={Math.ceil(
            commentsResponse.total_available / COMMENTS_PER_PAGE
          )}
          hasMore={commentsResponse.has_more}
          onPageChange={(newPage) => setPage(newPage)}
        />
      )}
    </section>
  );
}
