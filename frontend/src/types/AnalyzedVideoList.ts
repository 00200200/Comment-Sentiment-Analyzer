export interface AnalyzedVideoSummary {
  video_id: string;
  title: string;
  channel_name: string;
  thumbnail_url: string;
  published_at: string;
  view_count: number;
  comment_count: number;
  total_analyzed: number;
  analysis_state: string;
}

export interface AnalyzedVideoList {
  videos: AnalyzedVideoSummary[];
  offset: number;
  limit: number;
  total: number;
  has_more: boolean;
}
