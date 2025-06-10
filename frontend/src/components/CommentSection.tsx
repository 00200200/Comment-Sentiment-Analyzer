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
import type { SentimentTotals } from "@/types/CommentsResponse"; // <--- FIX 1: Add 'type' keyword
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
  const [keyword, setKeyword] = useState(""); // For author
  const [phrase, setPhrase] = useState(""); // For comment phrase
  const [sentimentFilter, setSentimentFilter] = useState<
    "" | "positive" | "negative" | "neutral" | "ambiguous"
  >("");
  const [minLikes, setMinLikes] = useState<number | null>(null);

  // Reset filters and page when URL changes
  useEffect(() => {
    setPage(1);
    setSortBy("published_at");
    setSortOrder("desc");
    setKeyword("");
    setPhrase(""); // Reset new phrase filter
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
    phrase: phrase || undefined, // Pass the new phrase filter
  });

  // Populate sentimentCounts from sentiment_totals if available, otherwise fallback to page-level counts
  const sentimentCounts: SentimentTotals =
    commentsResponse?.sentiment_totals || {
      positive: 0,
      neutral: 0,
      negative: 0,
      ambiguous: 0,
    };

  // Fallback for current page if sentiment_totals is not provided by backend
  if (!commentsResponse?.sentiment_totals) {
    commentsResponse?.comments?.forEach(({ sentiment_label }) => {
      const label = sentiment_label.toLowerCase();
      // Ensure label is one of the valid keys before incrementing
      if (
        label === "positive" ||
        label === "neutral" ||
        label === "negative" ||
        label === "ambiguous"
      ) {
        sentimentCounts[label as keyof typeof sentimentCounts]++;
      }
    });
  }

  const handleApplyFilters = () => {
    setPage(1); // Reset to first page when applying new filters
    refetch();
  };

  return (
    <section className="mt-8">
      {(commentsResponse?.total_available ?? 0) > 0 && ( // Use total_available for rendering CommentStats
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
              <div className="grid gap-2">
                <Label htmlFor="sortBy">Sort by</Label>
                <select
                  id="sortBy"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="h-8 border rounded p-1"
                >
                  <option value="published_at">Date</option>
                  <option value="like_count">Likes</option>
                  <option value="sentiment">Sentiment</option>
                </select>
                <Label htmlFor="sortOrder">Order</Label>
                <select
                  id="sortOrder"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="h-8 border rounded p-1"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
                <Label htmlFor="sentimentFilter">Sentiment</Label>
                <select
                  id="sentimentFilter"
                  value={sentimentFilter}
                  onChange={(e) => setSentimentFilter(e.target.value as any)} // Cast for sentiment type
                  className="h-8 border rounded p-1"
                >
                  <option value="">All</option>
                  <option value="positive">Positive</option>
                  <option value="neutral">Neutral</option>
                  <option value="negative">Negative</option>
                  <option value="ambiguous">Ambiguous</option>{" "}
                  {/* Added ambiguous */}
                </select>
                <Label htmlFor="keyword">Author</Label>
                <Input
                  id="keyword"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Filter by author"
                  className="h-8"
                />
                <Label htmlFor="phrase">Comment Phrase</Label>{" "}
                {/* New filter */}
                <Input
                  id="phrase"
                  value={phrase}
                  onChange={(e) => setPhrase(e.target.value)}
                  placeholder="Search comment text"
                  className="h-8"
                />
                <Label htmlFor="minLikes">Min Likes</Label>
                <Input
                  id="minLikes"
                  type="number"
                  min={0}
                  value={minLikes ?? ""}
                  onChange={(e) =>
                    setMinLikes(
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  placeholder="e.g., 10"
                  className="h-8"
                />
                <Button onClick={handleApplyFilters}>Apply Filters</Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {isLoading && <p>Loading comments...</p>}
      {error && (
        <p className="text-red-500">Error fetching comments: {error.message}</p>
      )}
      {!isLoading && commentsResponse?.comments?.length === 0 && (
        <p>No comments found matching your criteria.</p>
      )}

      <div className="space-y-3">
        {commentsResponse?.comments.map((comment) => (
          <CommentItem
            key={comment.id}
            author={comment.author}
            text={comment.text}
            likeCount={comment.like_count}
            sentiment={comment.sentiment_label}
            publishedAt={comment.published_at.toISOString()}
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
