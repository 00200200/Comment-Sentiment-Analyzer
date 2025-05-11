export interface VideoStats {
  title: string;
  channel_id: string;
  channel_name: string;
  thumbnail_url: string;
  view_count: number;
  like_count: number;
  dislike_count: number;
  comment_count: number;
  view_change_pct: number;
  sentiment_label: string;
  sentiment_positive_pct: number;
  engagement_level: string;
  engagement_pct: number;
  trend: string;
  trend_explanation: string;
}

export interface AnalyzeResponse {
  video_id: string;
  title: string;
  channel_id: string;
  channel_name: string;
  thumbnail_url: string;
  statistics: VideoStats;
  num_comments_analyzed: number;
  total_comments: number;
  analysis_state: string;
  data_fetched_at: number;
}
