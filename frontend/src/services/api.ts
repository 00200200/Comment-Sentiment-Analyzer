import type { AnalyzedVideoList } from "@/types/AnalyzedVideoList";
import type { ChartCommentsResponse } from "@/types/ChartCommentsResponse";
import type { CommentsResponse } from "@/types/CommentsResponse";
import type { VideoResponse } from "@/types/VideoResponse";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

/**
 * Triggers analysis of a YouTube video by URL.
 */
export async function analyzeVideo(url: string): Promise<VideoResponse> {
  try {
    const response = await fetch(
      `${BACKEND_URL}/videos?url=${encodeURIComponent(url)}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        `Failed to analyze video: ${errorData?.detail || response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`Error in analyzeVideo(${url}):`, error);
    throw error;
  }
}

/**
 * Fetches comments for a video by URL, with optional filtering and pagination.
 */
export async function fetchComments(
  url: string,
  options: {
    offset?: number;
    limit?: number;
    sentiment?: string;
    author?: string;
    minLikes?: number;
    sortBy?: "published_at" | "like_count" | "sentiment";
    sortOrder?: "asc" | "desc";
  } = {}
): Promise<CommentsResponse> {
  try {
    const params = new URLSearchParams();
    params.append("url", url);

    if (options.offset !== undefined)
      params.append("offset", options.offset.toString());
    if (options.limit !== undefined)
      params.append("limit", options.limit.toString());
    if (options.sentiment) params.append("sentiment", options.sentiment);
    if (options.author) params.append("author", options.author);
    if (options.minLikes !== undefined)
      params.append("min_likes", options.minLikes.toString());
    if (options.sortBy) params.append("sort_by", options.sortBy);
    if (options.sortOrder) params.append("sort_order", options.sortOrder);

    const response = await fetch(
      `${BACKEND_URL}/comments?${params.toString()}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        `Failed to fetch comments: ${errorData?.detail || response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`Error in fetchComments(${url}):`, error);
    throw error;
  }
}

/**
 * Fetches chart-compatible comment data for sentiment trends.
 */
export async function fetchChartData(
  url: string
): Promise<ChartCommentsResponse> {
  try {
    const response = await fetch(
      `${BACKEND_URL}/chart-data?url=${encodeURIComponent(url)}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        `Failed to fetch chart data: ${errorData?.detail || response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`Error in fetchChartData(${url}):`, error);
    throw error;
  }
}

/**
 * Fetches a paginated list of previously analyzed videos.
 */
export async function fetchAnalyzedVideos(
  offset = 0,
  limit = 25
): Promise<AnalyzedVideoList> {
  try {
    const params = new URLSearchParams({
      offset: offset.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(`${BACKEND_URL}/videos?${params.toString()}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        `Failed to fetch analyzed videos: ${errorData?.detail || response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error in fetchAnalyzedVideos:", error);
    throw error;
  }
}
