import type { AnalysisState, SentimentHeadline, SentimentLabel } from "./types";

export interface VideoResponse {
  // Youtube video metadata
  id: string; // Video ID
  title: string; // Video title
  channel_id: string; // Channel ID
  channel_name: string; // Channel name
  thumbnail_url: string; // Thumbnail URL
  view_count: number; // View count
  like_count: number; // Like count
  comment_count: number; // Comment count
  published_at: string; // Published date and time (using string for datetime)

  // Analysis metadata
  like_rate?: number; // Likes per 1000 views (Optional)
  sentiment_headline: SentimentHeadline; // Overall sentiment label (smart interpretation)
  average_sentiment_score: number; // Sentiment average score
  controversiality_score?: number; // How split the sentiment is (0 = unified, 1 = polarizing) (Optional)
  sentiment_totals?: { [key in SentimentLabel]?: number }; // Counts of each sentiment label (Optional)
  engagement_label: string; // Engagement level (Comments & likes as a percentage of views)
  engagement_rate: number; // Engagement rate

  // Comment analysis
  total_analyzed: number; // Total number of comments analyzed
  average_comment_length?: number; // Average comment length (optional)
  comment_rate?: number; // Comments per 1000 views (optional)

  // Analysis state
  analysis_state: AnalysisState; // Current state of analysis
  fetched_at: string; // When the video was fetched (using string for datetime)
  meta_last_update: string; // Last metadata update timestamp (using string for datetime)
  sentiment_last_update: string; // Last sentiment data update timestamp (using string for datetime)
}
