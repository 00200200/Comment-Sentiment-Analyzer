export interface VideoResponse {
  id: string;
  title: string;
  channel_id: string;
  channel_name: string;
  thumbnail_url: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  published_at: string;

  view_change_pct: number;
  sentiment_label: string;
  sentiment_positive_pct: number;
  engagement_level: string;
  engagement_pct: number;
  trend: string;
  trend_explanation: string;

  analysis_state: string;
  total_analyzed: number;
  fetched_at: string;
  last_update: string;
}
