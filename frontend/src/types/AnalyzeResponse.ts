export interface AnalyzeResponse {
  video_id: string;
  title: string;
  channel_id: string;
  statistics: {
    view_count: number;
    like_count: number;
    comment_count: number;
  };
  num_comments_analyzed: number;
}
