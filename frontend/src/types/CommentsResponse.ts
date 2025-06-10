import type { Comment } from "./Comment";

// Defines the structure for sentiment totals, matching backend's Dict[SentimentLabel, int]
export interface SentimentTotals {
  positive: number;
  neutral: number;
  negative: number;
  ambiguous: number; // Make sure 'ambiguous' is handled on your backend as well
}
export interface CommentsResponse {
  video_id: string;
  comments: Comment[];
  sentiment_totals: SentimentTotals; // Now included and typed
  total_available: number;
  total_expected: number;
  offset: number;
  limit: number;
  has_more: boolean;
  analysis_state: string;
}
