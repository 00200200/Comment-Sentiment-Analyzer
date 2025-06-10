// src/api/videosApi.ts

import type { AnalyzedVideoList } from "@/types/AnalyzedVideoList";
import type { VideoResponse } from "@/types/VideoResponse";
import { apiService } from "./apiService";

/**
 * Triggers analysis of a YouTube video by URL.
 * It also fetches its data. If the video is already analyzed, it returns the existing analysis.
 * If not, it triggers a background analysis task.
 */
export async function analyzeVideo(url: string): Promise<VideoResponse> {
  // Use a dedicated endpoint for triggering analysis if available,
  // otherwise, the current GET to /videos with URL is okay if it's designed that way.
  // Assuming it acts as a "get or create/analyze" for now.
  return apiService.get<VideoResponse>("/videos", {
    params: { url: url }, // The apiService.buildUrl will handle encoding the 'url' parameter
  });
}

/**
 * Fetches a paginated list of previously analyzed videos.
 */
export async function fetchAnalyzedVideos(
  offset = 0,
  limit = 25
): Promise<AnalyzedVideoList> {
  return apiService.get<AnalyzedVideoList>("/videos", {
    params: {
      offset: offset,
      limit: limit,
    },
  });
}
