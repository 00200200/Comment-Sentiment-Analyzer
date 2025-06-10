import type { CommentsResponse } from "@/types/CommentsResponse";
import {
  fetchComments,
  type FetchCommentsOptions,
} from "@/services/commentsApi"; // Updated import path and added type import for options
import { useQuery } from "@tanstack/react-query";

// Renamed and imported FetchCommentsOptions directly from commentsApi for consistency
// interface CommentQueryParams {
//   offset?: number;
//   limit?: number;
//   sentiment?: string; // This should ideally be SentimentLabel now
//   author?: string;
//   minLikes?: number;
//   sortBy?: "published_at" | "like_count" | "sentiment";
//   sortOrder?: "asc" | "desc";
//   phrase?: string; // Added phrase
// }

// Use the exact type from commentsApi to ensure consistency
export function useComments(
  videoUrl: string,
  params: FetchCommentsOptions = {}
) {
  return useQuery<CommentsResponse, Error>({
    queryKey: ["comments", videoUrl, params],
    // The videoId parameter for useComments should likely be the full video URL
    // to match the fetchComments function signature.
    queryFn: () => fetchComments(videoUrl, params),
    enabled: !!videoUrl,
    staleTime: 1000 * 60 * 2,
  });
}
