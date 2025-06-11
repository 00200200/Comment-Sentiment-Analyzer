import type { AnalysisState, SentimentLabel } from "./types";

export interface AnalyzedVideoSummary {
  id: string;
  title: string;
  channel_name: string;
  thumbnail_url: string;
  published_at: string; // Using string for datetime
  view_count: number;
  comment_count: number;
  sentiment_totals?: { [key in SentimentLabel]?: number }; // Optional
  total_analyzed: number;
  analysis_state: AnalysisState;
}

export interface AnalyzedVideoList {
  videos: AnalyzedVideoSummary[];
  offset: number;
  limit: number;
  total: number;
  has_more: boolean;
}
