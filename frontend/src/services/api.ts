import type { AnalyzeResponse } from "@/types/AnalyzeResponse";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

export async function analyzeVideo(url: string): Promise<AnalyzeResponse> {
  try {
    const response = await fetch(
      `${BACKEND_URL}/analyze?video_url=${encodeURIComponent(url)}`
    );
    if (!response.ok) throw new Error(`Failed to analyze the video ${url}`);
    return await response.json();
  } catch (error) {
    console.error(`Error in analyzeVideo(${url}):`, error);
    throw error;
  }
}

export async function fetchComments(videoId: string): Promise<Comment[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/comments/${videoId}`);
    if (!response.ok)
      throw new Error(`Failed to fetch comments for video ${videoId}`);
    return await response.json();
  } catch (error) {
    console.error(`Error in fetchComments(${videoId}):`, error);
    throw error;
  }
}
