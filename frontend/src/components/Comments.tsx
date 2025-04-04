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
import { fetchComments } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

const COMMENTS_PER_PAGE = 5;
const INITIAL_VISIBLE_COMMENTS = 2;

interface CommentsProps {
  videoId: string;
}

export default function Comments({ videoId }: CommentsProps) {
  const {
    data: comments = [],
    isLoading,
    error,
  } = useQuery<Comment[]>({
    queryKey: ["comments", videoId],
    queryFn: () => fetchComments(videoId),
    enabled: !!videoId,
  });

  const [visibleComments, setVisibleComments] = useState(
    INITIAL_VISIBLE_COMMENTS
  );
  const [page, setPage] = useState(1);
  const [showPagination, setShowPagination] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest");
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    setPage(1);
    setVisibleComments(INITIAL_VISIBLE_COMMENTS);
    setShowPagination(false);
  }, [videoId]);

  const sortedComments = [...comments].sort((a, b) => {
    if (sortOrder === "likes") {
      return b.like_count - a.like_count;
    }
    return (
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );
  });

  const filteredComments = sortedComments.filter((comment) =>
    comment.text.toLowerCase().includes(keyword.toLowerCase())
  );

  const paginatedComments = filteredComments.slice(
    (page - 1) * COMMENTS_PER_PAGE,
    page * COMMENTS_PER_PAGE
  );

  const handleShowMore = () => {
    setVisibleComments(paginatedComments.length);
    setShowPagination(true);
  };

  return (
    <section className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Comments</h2>
        <div className="flex items-center gap-4">
          <span className="text-gray-500 text-sm">
            {filteredComments.length} comments found
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
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="col-span-2 h-8 border rounded p-1"
                    >
                      <option value="newest">Newest</option>
                      <option value="likes">Most Liked</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="keyword">Keyword</Label>
                    <Input
                      id="keyword"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="Enter a word"
                      className="col-span-2 h-8"
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {isLoading && <p>Loading comments...</p>}
      {error && <p className="text-red-500">Failed to load comments.</p>}
      {!isLoading && !error && filteredComments.length === 0 && (
        <p>No comments available.</p>
      )}

      <div className="space-y-4">
        {paginatedComments.slice(0, visibleComments).map((comment) => (
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

      {filteredComments.length > INITIAL_VISIBLE_COMMENTS && (
        <div className="mt-4 flex flex-col items-center space-y-2">
          {visibleComments < paginatedComments.length && !showPagination && (
            <Button onClick={handleShowMore}>Show More</Button>
          )}

          {showPagination && filteredComments.length > COMMENTS_PER_PAGE && (
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
                  <PaginationNext
                    onClick={
                      page * COMMENTS_PER_PAGE < filteredComments.length
                        ? () => setPage((prev) => prev + 1)
                        : undefined
                    }
                    className={
                      page * COMMENTS_PER_PAGE >= filteredComments.length
                        ? "opacity-50 pointer-events-none"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
    </section>
  );
}
