// src/api/commentsApi.ts

import type { ChartCommentsResponse } from "@/types/ChartCommentsResponse";
import type { Comment } from "@/types/Comment"; // Import the Comment type for transformation
import type { CommentsResponse } from "@/types/CommentsResponse";
import type { SentimentLabel } from "@/types/types"; // Assuming this is correct
import { apiService } from "./apiService";

/**
 * Options for fetching comments.
 */
export interface FetchCommentsOptions {
  offset?: number;
  limit?: number;
  sentiment?: SentimentLabel;
  author?: string;
  minLikes?: number;
  sortBy?: "published_at" | "like_count" | "sentiment";
  sortOrder?: "asc" | "desc";
  phrase?: string;
}

/**
 * Fetches comments for a video by URL, with optional filtering and pagination.
 *
 * @param videoUrl The URL of the video to fetch comments for.
 * @param options Filtering and pagination options.
 * @returns A Promise that resolves to CommentsResponse, with published_at as Date objects.
 */
export async function fetchComments(
  videoUrl: string, // Renamed 'url' to 'videoUrl' for clarity
  options: FetchCommentsOptions = {}
): Promise<CommentsResponse> {
  const response = await apiService.get<CommentsResponse>("/comments", {
    params: {
      url: videoUrl, // Backend expects 'url' for the video
      offset: options.offset,
      limit: options.limit,
      sentiment: options.sentiment,
      author: options.author,
      min_likes: options.minLikes, // Backend expects min_likes
      phrase: options.phrase, // Pass phrase to backend
      sort_by: options.sortBy, // Backend expects sort_by
      sort_order: options.sortOrder, // Backend expects sort_order
    },
  });

  // Transform 'published_at' strings from the backend into Date objects
  const transformedComments: Comment[] = response.comments.map((comment) => ({
    ...comment,
    published_at: new Date(comment.published_at), // Convert string to Date object
  }));

  return {
    ...response,
    comments: transformedComments,
  };
}

/**
 * Fetches chart-compatible comment data for sentiment trends for a given video URL.
 *
 * @param url The URL of the video to fetch chart data for.
 * @returns A Promise that resolves to ChartCommentsResponse.
 */
export async function fetchChartData(
  url: string
): Promise<ChartCommentsResponse> {
  // Assuming ChartCommentSchema.published_at is string on frontend too, no date conversion needed here.
  return apiService.get<ChartCommentsResponse>("/chart-data", {
    params: { url: url },
  });
}
