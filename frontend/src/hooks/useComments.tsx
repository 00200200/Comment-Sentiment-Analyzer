import type { CommentsResponse } from "@/types/CommentsResponse";
import { fetchComments } from "@/services/api";
// src/hooks/useComments.ts
import { useQuery } from "@tanstack/react-query";

interface CommentQueryParams {
  offset?: number;
  limit?: number;
  sentiment?: string;
  author?: string;
  minLikes?: number;
  sortBy?: "published_at" | "like_count" | "sentiment";
  sortOrder?: "asc" | "desc";
}

export function useComments(videoId: string, params: CommentQueryParams = {}) {
  return useQuery<CommentsResponse, Error>({
    queryKey: ["comments", videoId, params],
    queryFn: () => fetchComments(videoId, params),
    enabled: !!videoId,
    staleTime: 1000 * 60 * 2,
  });
}
