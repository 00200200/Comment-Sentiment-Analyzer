// src/types/AnalyzeResponse.ts
export interface AnalyzeResponse {
  video_id: string;
  title: string;
  channel_id: string;
  thumbnail_url?: string;

  statistics: {
    view_count: number;
    like_count: number;
    dislike_count?: number;
    comment_count: number;

    view_change_pct?: number;
    sentiment_label?: string;
    sentiment_positive_pct?: number;
    engagement_level?: string;
    engagement_pct?: number;
    trend?: string;
    trend_explanation?: string;
  };
}
