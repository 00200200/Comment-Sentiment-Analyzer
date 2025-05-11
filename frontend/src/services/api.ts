import type { AnalyzeResponse } from "@/types/AnalyzeResponse";
import type { CommentAnalysisProgress } from "@/types/CommentAnalysisProgress";
import type { CommentsResponse } from "@/types/CommentsResponse";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

/**
 * Analyzes a YouTube video and returns initial results
 */
export async function analyzeVideo(url: string): Promise<AnalyzeResponse> {
  try {
    const response = await fetch(
      `${BACKEND_URL}/analyze?video_url=${encodeURIComponent(url)}`
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
 * Fetches comments for a video with optional filtering and pagination
 */
export async function fetchComments(
  videoId: string,
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

    // Add optional parameters if provided
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

    const url = `${BACKEND_URL}/comments/${videoId}${params.toString() ? "?" + params.toString() : ""}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        `Failed to fetch comments: ${errorData?.detail || response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`Error in fetchComments(${videoId}):`, error);
    throw error;
  }
}

/**
 * Gets the current progress of comment analysis
 */
export async function getAnalysisProgress(
  videoId: string
): Promise<CommentAnalysisProgress> {
  try {
    const response = await fetch(`${BACKEND_URL}/analysis-progress/${videoId}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        `Failed to get analysis progress: ${errorData?.detail || response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`Error in getAnalysisProgress(${videoId}):`, error);
    throw error;
  }
}

/**
 * Manually triggers continued analysis for a video
 */
export async function continueAnalysis(videoId: string): Promise<{
  message: string;
  state: string;
  current_progress?: any;
}> {
  try {
    const response = await fetch(`${BACKEND_URL}/analyze/continue/${videoId}`, {
      method: "POST",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        `Failed to continue analysis: ${errorData?.detail || response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`Error in continueAnalysis(${videoId}):`, error);
    throw error;
  }
}

// src/services/api.ts
export async function fetchChartData(videoId: string) {
  const response = await fetch(`${BACKEND_URL}/chart-data/${videoId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch chart data");
  }

  return response.json(); // Return the parsed JSON response
}
