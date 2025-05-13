import { Card, CardContent } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SlidersHorizontal } from "lucide-react";
import { StatBlock } from "./StatBlock";
import { useComments } from "@/hooks/useComments";

const COMMENTS_PER_PAGE = 5;

interface CommentsProps {
  url: string; // ✅ Updated from videoId
}

export default function Comments({ url }: CommentsProps) {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<
    "published_at" | "like_count" | "sentiment" | undefined
  >("published_at");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc" | undefined>(
    "desc"
  );
  const [keyword, setKeyword] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("");
  const [minLikes, setMinLikes] = useState<number | null>(null);

  // ✅ Reset on url change
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

  const applyFilters = () => refetch();

  const sentimentCounts = {
    positive: 0,
    negative: 0,
    neutral: 0,
    ambiguous: 0,
  };

  if (commentsResponse?.comments) {
    commentsResponse.comments.forEach((comment) => {
      const label = comment.sentiment_label.toLowerCase();
      if (label in sentimentCounts) {
        sentimentCounts[label as keyof typeof sentimentCounts] += 1;
      }
    });
  }

  return (
    <section className="mt-8">
      {!isLoading && !error && commentsResponse!.comments.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatBlock label="Positive" value={sentimentCounts.positive} />
          <StatBlock label="Neutral" value={sentimentCounts.neutral} />
          <StatBlock label="Negative" value={sentimentCounts.negative} />
          <StatBlock label="Ambiguous" value={sentimentCounts.ambiguous} />
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Comments</h2>
        <div className="flex items-center gap-4">
          <span className="text-gray-500 text-sm">
            {commentsResponse?.total_available ?? 0} comments analyzed
          </span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" /> Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Filter Options</h4>
                </div>
                <div className="grid gap-2">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label>Sort by</Label>
                    <select
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(
                          e.target.value as
                            | "published_at"
                            | "like_count"
                            | "sentiment"
                        )
                      }
                      className="col-span-2 h-8 border rounded p-1"
                    >
                      <option value="published_at">Date</option>
                      <option value="like_count">Likes</option>
                      <option value="sentiment">Sentiment</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label>Order</Label>
                    <select
                      value={sortOrder}
                      onChange={(e) =>
                        setSortOrder(e.target.value as "desc" | "asc")
                      }
                      className="col-span-2 h-8 border rounded p-1"
                    >
                      <option value="desc">Descending</option>
                      <option value="asc">Ascending</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label>Sentiment</Label>
                    <select
                      value={sentimentFilter}
                      onChange={(e) => setSentimentFilter(e.target.value)}
                      className="col-span-2 h-8 border rounded p-1"
                    >
                      <option value="">All</option>
                      <option value="positive">Positive</option>
                      <option value="negative">Negative</option>
                      <option value="neutral">Neutral</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="author">Author</Label>
                    <Input
                      id="author"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="Search by author"
                      className="col-span-2 h-8"
                    />
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="minLikes">Min likes</Label>
                    <Input
                      id="minLikes"
                      type="number"
                      min="0"
                      value={minLikes !== null ? minLikes : ""}
                      onChange={(e) =>
                        setMinLikes(
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                      placeholder="Minimum likes"
                      className="col-span-2 h-8"
                    />
                  </div>

                  <Button onClick={applyFilters} className="mt-2">
                    Apply Filters
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {isLoading && <p>Loading comments...</p>}
      {error && (
        <p className="text-red-500">Failed to load comments: {error.message}</p>
      )}
      {!isLoading &&
        !error &&
        (!commentsResponse?.comments ||
          commentsResponse.comments.length === 0) && (
          <p>No comments available.</p>
        )}

      {commentsResponse?.analysis_state === "in_progress" && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded mb-4">
          <p>
            Still analyzing comments... {commentsResponse.total_available} of{" "}
            {commentsResponse.total_available} analyzed so far.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {commentsResponse?.comments?.map((comment) => (
          <Card key={comment.comment_id}>
            <CardContent className="p-4">
              <h3 className="font-medium">{comment.author}</h3>
              <p className="text-gray-700 dark:text-gray-300">{comment.text}</p>
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>Likes: {comment.like_count}</span>
                <span>Sentiment: {comment.sentiment_label}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {commentsResponse &&
        commentsResponse.total_available > COMMENTS_PER_PAGE && (
          <div className="mt-4 flex flex-col items-center space-y-2">
            <Pagination className="mt-2">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={
                      page > 1
                        ? () => setPage((prev) => Math.max(prev - 1, 1))
                        : undefined
                    }
                    className={
                      page === 1 ? "opacity-50 pointer-events-none" : ""
                    }
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="px-4">
                    Page {page} of{" "}
                    {Math.ceil(
                      commentsResponse.total_available / COMMENTS_PER_PAGE
                    )}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={
                      commentsResponse.has_more
                        ? () => setPage((prev) => prev + 1)
                        : undefined
                    }
                    className={
                      !commentsResponse.has_more
                        ? "opacity-50 pointer-events-none"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
    </section>
  );
}
